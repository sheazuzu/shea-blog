const nodemailer = require('nodemailer');
require('dotenv').config();

const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`Missing required SMTP config: ${missing.join(', ')}`);
    process.exit(1);
}

const port = Number(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    requireTLS: port !== 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify()
    .then(() => {
        console.log('SMTP connection successful');
    })
    .catch((error) => {
        console.error(`SMTP connection failed: ${error.message}`);
        process.exit(1);
    });
