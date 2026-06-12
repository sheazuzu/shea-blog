const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/html');

function maskEmail(email = '') {
    const [name, domain] = email.split('@');
    if (!name || !domain) {
        return '';
    }

    return `${name.slice(0, 2)}***@${domain}`;
}

function getMissingConfig(config) {
    const missing = [];

    if (!config.smtp.host) missing.push('SMTP_HOST');
    if (!config.smtp.user) missing.push('SMTP_USER');
    if (!config.smtp.pass) missing.push('SMTP_PASS');
    if (!config.contact.recipient) missing.push('CONTACT_TO');

    return missing;
}

function createTransporter(config) {
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        requireTLS: !config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass
        },
        debug: config.smtp.debug,
        logger: config.smtp.debug
    });
}

function createMailService(config) {
    return {
        missingConfig() {
            return getMissingConfig(config);
        },

        async verify() {
            await createTransporter(config).verify();

            return {
                server: config.smtp.host,
                port: config.smtp.port,
                user: maskEmail(config.smtp.user)
            };
        },

        async sendContactMessage(contact) {
            const transporter = createTransporter(config);
            const mailOptions = {
                from: config.smtp.user,
                to: config.contact.recipient,
                replyTo: contact.email,
                subject: `博客联系表单: ${contact.subject}`,
                text: `姓名: ${contact.name}\n邮箱: ${contact.email}\n主题: ${contact.subject}\n\n${contact.message}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">新的联系表单提交</h2>
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
                            <p><strong>姓名:</strong> ${escapeHtml(contact.name)}</p>
                            <p><strong>邮箱:</strong> ${escapeHtml(contact.email)}</p>
                            <p><strong>主题:</strong> ${escapeHtml(contact.subject)}</p>
                            <p><strong>消息:</strong></p>
                            <div style="background: white; padding: 15px; border-left: 4px solid #0078d4; margin-top: 10px;">
                                ${escapeHtml(contact.message).replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    </div>
                `
            };

            return transporter.sendMail(mailOptions);
        }
    };
}

module.exports = { createMailService };
