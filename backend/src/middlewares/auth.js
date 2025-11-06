// src/middlewares/auth.js
import bcrypt from 'bcrypt';
import { getSession } from '../config/db.js';

/**
 * Basic Auth middleware
 * Header example: Authorization: Basic base64(email:password)
 */
export const basicAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ success: false, message: 'Missing Authorization header' });
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
        return res.status(401).json({ success: false, message: 'Invalid Authorization header format' });
    }

    const session = getSession();
    try {
        // Find user by email
        const result = await session.run(`MATCH (u:User {email: $email}) RETURN u`, { email });

        if (result.records.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = result.records[0].get('u').properties;

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Attach user info to request
        req.user = { id: user.id, email: user.email, name: user.name };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        await session.close();
    }
};
