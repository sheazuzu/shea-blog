const express = require('express');
const { createMemoryRateLimiter } = require('../middleware/rateLimiter');

function normalizeField(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

function validateContactPayload(body, limits) {
    const name = normalizeField(body.name);
    const email = normalizeField(body.email);
    const subject = normalizeField(body.subject);
    const message = normalizeField(body.message);

    if (!name || !email || !subject || !message) {
        return { error: '所有字段都是必填的' };
    }

    if (name.length > limits.maxFieldLength || email.length > limits.maxFieldLength || subject.length > limits.maxFieldLength) {
        return { error: `姓名、邮箱和主题不能超过 ${limits.maxFieldLength} 个字符` };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: '邮箱格式不正确' };
    }

    if (message.length > limits.maxMessageLength) {
        return { error: `消息长度不能超过 ${limits.maxMessageLength} 个字符` };
    }

    return { data: { name, email, subject, message } };
}

function createContactRouter({ config, mailService }) {
    const router = express.Router();
    const rateLimit = createMemoryRateLimiter({
        windowMs: config.contact.rateWindowMs,
        maxRequests: config.contact.rateMaxRequests
    });

    router.post('/', rateLimit, async (req, res) => {
        try {
            const { data, error } = validateContactPayload(req.body || {}, config.contact);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error
                });
            }

            const missingConfig = mailService.missingConfig();
            if (missingConfig.length > 0) {
                console.error('SMTP config missing:', missingConfig.join(', '));
                return res.status(503).json({
                    success: false,
                    message: '邮件服务暂未配置，请稍后再试'
                });
            }

            const info = await mailService.sendContactMessage(data);
            console.log('Contact email sent:', info.messageId);

            res.json({
                success: true,
                message: '消息发送成功！我会尽快回复您。'
            });
        } catch (error) {
            console.error('Contact email failed:', error);
            res.status(500).json({
                success: false,
                message: '消息发送失败，请稍后重试'
            });
        }
    });

    return router;
}

module.exports = { createContactRouter, validateContactPayload };
