const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('./config');
const { createHealthRouter } = require('./routes/health');
const { createContactRouter } = require('./routes/contact');
const { createSmtpRouter } = require('./routes/smtp');
const { createMailService } = require('./services/mailService');

function createApp(options = {}) {
    const app = express();
    const mailService = options.mailService || createMailService(config);

    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
        next();
    });
    app.use(cors({ origin: config.corsOrigin }));
    app.use(express.json({ limit: config.requestJsonLimit }));
    app.use(express.static(config.staticDir, {
        etag: true,
        maxAge: config.environment === 'production' ? '1h' : 0
    }));

    app.get('/', (req, res) => {
        res.sendFile(path.join(config.staticDir, 'index.html'));
    });

    app.use('/health', createHealthRouter(config));
    app.use('/contact', createContactRouter({ config, mailService }));
    app.use('/test-smtp', createSmtpRouter({ config, mailService }));

    app.use((error, req, res, next) => {
        console.error('Server error:', error);
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

    return app;
}

module.exports = { createApp };
