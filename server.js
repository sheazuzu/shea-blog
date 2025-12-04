const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 提供静态文件服务

// SMTP邮件配置 - 支持现代身份验证
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com', // Hotmail/Outlook SMTP服务器
    port: process.env.SMTP_PORT || 587,
    secure: false, // TLS需要设置为false
    requireTLS: true, // 要求TLS连接
    auth: {
        user: process.env.SMTP_USER || 'sheazuzu@hotmail.com',
        pass: process.env.SMTP_PASS // 密码从环境变量获取
    },
    tls: {
        ciphers: 'TLSv1.2', // 使用更安全的TLS版本
        rejectUnauthorized: false // 允许自签名证书
    }
});

// 根路径 - 返回前端页面
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Shea Blog后端服务运行正常' });
});

// 联系表单处理接口
app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // 验证必填字段
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: '所有字段都是必填的'
            });
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '邮箱格式不正确'
            });
        }
        
        // 邮件内容
        const mailOptions = {
            from: process.env.SMTP_USER || 'sheazuzu@hotmail.com',
            to: 'sheazuzu@hotmail.com', // 发送到您的邮箱
            subject: `博客联系表单: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">新的联系表单提交</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>姓名:</strong> ${name}</p>
                        <p><strong>邮箱:</strong> ${email}</p>
                        <p><strong>主题:</strong> ${subject}</p>
                        <p><strong>消息:</strong></p>
                        <div style="background: white; padding: 15px; border-left: 4px solid #0078d4; margin-top: 10px;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        此邮件来自您的个人博客网站联系表单
                    </p>
                </div>
            `,
            text: `
新的联系表单提交

姓名: ${name}
邮箱: ${email}
主题: ${subject}
消息:
${message}

此邮件来自您的个人博客网站联系表单
            `
        };
        
        // 发送邮件
        const info = await transporter.sendMail(mailOptions);
        
        console.log('邮件发送成功:', info.messageId);
        
        res.json({
            success: true,
            message: '消息发送成功！我会尽快回复您。',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('邮件发送失败:', error);
        
        res.status(500).json({
            success: false,
            message: '消息发送失败，请稍后重试或直接发送邮件至 sheazuzu@hotmail.com'
        });
    }
});

// 测试SMTP连接
app.get('/test-smtp', async (req, res) => {
    try {
        await transporter.verify();
        res.json({
            success: true,
            message: 'SMTP连接测试成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'SMTP连接测试失败: ' + error.message
        });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Shea Blog后端服务启动成功`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📧 邮件接口: http://localhost:${PORT}/contact`);
    console.log(`❤️  健康检查: http://localhost:${PORT}/health`);
    
    // 检查环境变量配置
    if (!process.env.SMTP_PASS) {
        console.warn('⚠️  警告: SMTP_PASS环境变量未设置，邮件发送功能可能无法正常工作');
        console.log('💡 提示: 请创建.env文件并设置SMTP_PASS=您的邮箱密码');
    }
});

module.exports = app;