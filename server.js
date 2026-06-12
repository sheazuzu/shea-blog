const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const packageInfo = require('./package.json');

const STATIC_DIR = path.join(__dirname, 'src');
const CONTACT_RECIPIENT = process.env.CONTACT_TO || process.env.SMTP_USER;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_DEBUG = process.env.SMTP_DEBUG === 'true';
const MAX_FIELD_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const CONTACT_WINDOW_MS = Number(process.env.CONTACT_RATE_WINDOW_MS) || 15 * 60 * 1000;
const CONTACT_MAX_REQUESTS = Number(process.env.CONTACT_RATE_MAX) || 5;
const contactAttempts = new Map();

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeField(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function maskEmail(email = '') {
    const [name, domain] = email.split('@');
    if (!name || !domain) {
        return '';
    }

    return `${name.slice(0, 2)}***@${domain}`;
}

function getSmtpConfig() {
    return {
        host: process.env.SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        requireTLS: !SMTP_SECURE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        debug: SMTP_DEBUG,
        logger: SMTP_DEBUG
    };
}

function validateSmtpConfig() {
    const missing = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].filter((key) => !process.env[key]);

    if (!CONTACT_RECIPIENT) {
        missing.push('CONTACT_TO');
    }

    return missing;
}

function contactRateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const entry = contactAttempts.get(key) || { count: 0, resetAt: now + CONTACT_WINDOW_MS };

    if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + CONTACT_WINDOW_MS;
    }

    entry.count += 1;
    contactAttempts.set(key, entry);

    if (entry.count > CONTACT_MAX_REQUESTS) {
        return res.status(429).json({
            success: false,
            message: '请求过于频繁，请稍后再试'
        });
    }

    next();
}

function buildTransporter() {
    return nodemailer.createTransport(getSmtpConfig());
}

function validateContactPayload(body) {
    const name = normalizeField(body.name);
    const email = normalizeField(body.email);
    const subject = normalizeField(body.subject);
    const message = normalizeField(body.message, MAX_MESSAGE_LENGTH);

    if (!name || !email || !subject || !message) {
        return { error: '所有字段都是必填的' };
    }

    if (name.length > MAX_FIELD_LENGTH || email.length > MAX_FIELD_LENGTH || subject.length > MAX_FIELD_LENGTH) {
        return { error: `姓名、邮箱和主题不能超过 ${MAX_FIELD_LENGTH} 个字符` };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: '邮箱格式不正确' };
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return { error: `消息长度不能超过 ${MAX_MESSAGE_LENGTH} 个字符` };
    }

    return { data: { name, email, subject, message } };
}

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    next();
});
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));
app.use(express.json({ limit: '32kb' }));
app.use(express.static(STATIC_DIR));

app.get('/', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        version: packageInfo.version,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.post('/contact', contactRateLimit, async (req, res) => {
    try {
        const { data, error } = validateContactPayload(req.body || {});
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const missingConfig = validateSmtpConfig();
        if (missingConfig.length > 0) {
            console.error('SMTP配置缺失:', missingConfig.join(', '));
            return res.status(503).json({
                success: false,
                message: '邮件服务暂未配置，请稍后再试'
            });
        }

        const { name, email, subject, message } = data;
        const transporter = buildTransporter();
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: CONTACT_RECIPIENT,
            replyTo: email,
            subject: `博客联系表单: ${subject}`,
            text: `姓名: ${name}\n邮箱: ${email}\n主题: ${subject}\n\n${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">新的联系表单提交</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>姓名:</strong> ${escapeHtml(name)}</p>
                        <p><strong>邮箱:</strong> ${escapeHtml(email)}</p>
                        <p><strong>主题:</strong> ${escapeHtml(subject)}</p>
                        <p><strong>消息:</strong></p>
                        <div style="background: white; padding: 15px; border-left: 4px solid #0078d4; margin-top: 10px;">
                            ${escapeHtml(message).replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info.messageId);

        res.json({
            success: true,
            message: '消息发送成功！我会尽快回复您。'
        });
    } catch (error) {
        console.error('邮件发送失败:', error);
        res.status(500).json({
            success: false,
            message: '消息发送失败，请稍后重试'
        });
    }
});

app.get('/test-smtp', async (req, res) => {
    try {
        const missingConfig = validateSmtpConfig();
        if (missingConfig.length > 0) {
            return res.status(503).json({
                success: false,
                message: 'SMTP配置不完整',
                missing: missingConfig
            });
        }

        await buildTransporter().verify();
        console.log('SMTP连接测试成功:', process.env.SMTP_HOST);
        res.json({
            success: true,
            message: 'SMTP连接测试成功',
            server: process.env.SMTP_HOST,
            port: SMTP_PORT,
            user: maskEmail(process.env.SMTP_USER)
        });
    } catch (error) {
        console.error('SMTP连接测试失败:', error.message);
        res.status(500).json({
            success: false,
            message: 'SMTP连接测试失败'
        });
    }
});

app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('Shea Blog服务启动成功');
        console.log(`服务地址: http://localhost:${PORT}`);
    });
}

module.exports = app;
