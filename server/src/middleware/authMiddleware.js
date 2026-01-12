import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 * Adds user info to req.user if token is valid
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            name: decoded.name
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Optional auth middleware - doesn't reject if no token,
 * but adds user info if token is present and valid
 */
export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.userId,
                username: decoded.username,
                name: decoded.name
            };
        } catch (error) {
            // Token invalid, but continue without user
        }
    }
    next();
}

export default authMiddleware;
