const express = require('express');

function createSmtpRouter({ mailService }) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const missingConfig = mailService.missingConfig();
            if (missingConfig.length > 0) {
                return res.status(503).json({
                    success: false,
                    message: 'SMTP配置不完整',
                    missing: missingConfig
                });
            }

            const details = await mailService.verify();
            console.log('SMTP connection verified:', details.server);
            res.json({
                success: true,
                message: 'SMTP连接测试成功',
                server: details.server,
                port: details.port,
                user: details.user
            });
        } catch (error) {
            console.error('SMTP connection failed:', error.message);
            res.status(500).json({
                success: false,
                message: 'SMTP连接测试失败'
            });
        }
    });

    return router;
}

module.exports = { createSmtpRouter };
