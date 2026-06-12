function createMemoryRateLimiter(options) {
    const attempts = new Map();
    const windowMs = options.windowMs;
    const maxRequests = options.maxRequests;

    function prune(now) {
        for (const [key, entry] of attempts.entries()) {
            if (now > entry.resetAt) {
                attempts.delete(key);
            }
        }
    }

    return function rateLimiter(req, res, next) {
        const now = Date.now();
        const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };

        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + windowMs;
        }

        entry.count += 1;
        attempts.set(key, entry);

        if (attempts.size > maxRequests * 100) {
            prune(now);
        }

        if (entry.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: '请求过于频繁，请稍后再试'
            });
        }

        next();
    };
}

module.exports = { createMemoryRateLimiter };
