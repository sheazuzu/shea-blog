const { createApp } = require('./src/server/app');
const { config } = require('./src/server/config');

const app = createApp();

function start() {
    const server = app.listen(config.port, () => {
        console.log('Shea Blog service started');
        console.log(`Listening on http://localhost:${config.port}`);
    });

    function shutdown(signal) {
        console.log(`${signal} received, shutting down`);
        server.close(() => {
            process.exit(0);
        });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
}

if (require.main === module) {
    start();
}

module.exports = app;
module.exports.start = start;
