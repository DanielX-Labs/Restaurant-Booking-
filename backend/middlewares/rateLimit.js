const attempts = new Map();

export const rateLimit = ({ windowMs = 15 * 60 * 1000, limit = 10 } = {}) =>
  (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    if (attempts.size > 1000) {
      for (const [attemptKey, entry] of attempts) if (entry.resetAt <= now) attempts.delete(attemptKey);
    }
    const current = attempts.get(key);
    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > limit) {
      return res.status(429).json({ success: false, message: "Too many attempts. Please try again later." });
    }
    next();
  };
