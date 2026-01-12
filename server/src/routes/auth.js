import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../services/db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user by username
        const result = await db.execute({
            sql: 'SELECT id, username, password_hash, name FROM users WHERE username = ?',
            args: [username]
        });

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/auth/verify
 * Verify JWT token is valid
 */
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            valid: true,
            user: {
                id: decoded.userId,
                username: decoded.username,
                name: decoded.name
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info from token
 */
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            id: decoded.userId,
            username: decoded.username,
            name: decoded.name
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
