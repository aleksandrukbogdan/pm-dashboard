import { logActivity } from '../services/activityLogger.js';

/**
 * Middleware to log user activity on API calls
 */
export function activityLogger(action) {
    return async (req, res, next) => {
        // Store original end function
        const originalEnd = res.end;

        // Override end to log after response
        res.end = function (...args) {
            // Only log successful requests
            if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
                logActivity({
                    userId: req.user.id,
                    username: req.user.username,
                    userName: req.user.name,
                    action: action,
                    details: JSON.stringify({
                        method: req.method,
                        path: req.path,
                        query: req.query,
                        statusCode: res.statusCode
                    }),
                    ipAddress: req.ip || req.connection?.remoteAddress
                });
            }

            // Call original end
            return originalEnd.apply(this, args);
        };

        next();
    };
}

export default activityLogger;
