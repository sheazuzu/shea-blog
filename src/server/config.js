const path = require('path');
const packageInfo = require('../../package.json');

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const config = {
    appName: 'shea-blog',
    version: packageInfo.version,
    environment: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    staticDir: path.join(__dirname, '..'),
    requestJsonLimit: process.env.REQUEST_JSON_LIMIT || '32kb',
    corsOrigin: process.env.CORS_ORIGIN || false,
    contact: {
        recipient: process.env.CONTACT_TO || process.env.SMTP_USER,
        maxFieldLength: Number(process.env.CONTACT_MAX_FIELD_LENGTH) || 200,
        maxMessageLength: Number(process.env.CONTACT_MAX_MESSAGE_LENGTH) || 5000,
        rateWindowMs: Number(process.env.CONTACT_RATE_WINDOW_MS) || 15 * 60 * 1000,
        rateMaxRequests: Number(process.env.CONTACT_RATE_MAX) || 5
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        debug: process.env.SMTP_DEBUG === 'true'
    }
};

module.exports = { config };
