const express = require('express');

function createHealthRouter(config) {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.json({
            status: 'OK',
            message: '服务运行正常',
            timestamp: new Date().toISOString(),
            version: config.version,
            uptime: process.uptime(),
            environment: config.environment
        });
    });

    return router;
}

module.exports = { createHealthRouter };
