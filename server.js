// 导入必要的依赖包
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static('public')); // 提供静态文件服务

// 配置SMTP邮件传输器
// 支持Gmail、Outlook等主流邮件服务商
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', // SMTP服务器地址
    port: process.env.SMTP_PORT || 587, // SMTP端口
    secure: false, // 不使用SSL
    requireTLS: true, // 要求TLS加密
    auth: {
        user: process.env.SMTP_USER || 'sheaaazuzu@gmail.com', // 发件人邮箱
        pass: process.env.SMTP_PASS // 应用专用密码
    },
    debug: true, // 启用调试模式
    logger: true // 启用日志记录
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        version: '2.5.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: '所有字段都是必填的'
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '邮箱格式不正确'
            });
        }
        
        const mailOptions = {
            from: process.env.SMTP_USER || 'sheaaazuzu@gmail.com',
            to: 'sheazuzu@hotmail.com',
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
        await transporter.verify();
        console.log('✅ SMTP连接测试成功 - 服务器:', process.env.SMTP_HOST || 'smtp.gmail.com');
        res.json({
            success: true,
            message: 'SMTP连接测试成功',
            server: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            user: process.env.SMTP_USER || 'sheaaazuzu@gmail.com'
        });
    } catch (error) {
        console.error('❌ SMTP连接测试失败:', error.message);
        console.error('SMTP配置检查:');
        console.error('- 服务器:', process.env.SMTP_HOST || 'smtp.gmail.com');
        console.error('- 端口:', process.env.SMTP_PORT || 587);
        console.error('- 用户:', process.env.SMTP_USER || 'sheaaazuzu@gmail.com');
        console.error('- 密码配置:', process.env.SMTP_PASS ? '已设置' : '未设置');
        
        res.status(500).json({
            success: false,
            message: 'SMTP连接测试失败: ' + error.message,
            details: {
                server: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                user: process.env.SMTP_USER || 'sheaaazuzu@gmail.com',
                error: error.message
            }
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

app.listen(PORT, () => {
    console.log(`🚀 Shea Blog服务启动成功`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
});

module.exports = app;