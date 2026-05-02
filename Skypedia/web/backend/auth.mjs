import express from 'express';
import jwt from 'jsonwebtoken';
import pool from './db.mjs';

const router = express.Router();
const SECRET_KEY = 'k58DK4JM0unSUFjdhptPyFKscQcMCp4M';

router.post('/register', async (req, res) => {
    let { username, password, token } = req.body;
    if (!username || typeof username !== 'string' || username.length < 3 || /^[A-Z]{3,10}_/.test(username)) {
        return res.status(400).json({ error: 'Invalid username' });
    }
    if (!password || typeof password !== 'string' || password.length < 3) {
        return res.status(400).json({ error: 'Invalid password' });
    }
    if (token){
        try {
            const groupResult = await pool.query('SELECT * FROM groups WHERE token = $1', [token]);
            if (groupResult.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid group token' });
            }
            username = `${groupResult.rows[0].name}_${username}`;
        } catch (err) {
            console.error('Error verifying group:', err);
            return res.status(500).json({ error: 'Error verifying group' });
        }
    }

    try {
        const result = await pool.query(
            'INSERT INTO owners (username, password) VALUES ($1, $2) RETURNING username',
            [username, password]
        );
        res.status(201).json({ username: result.rows[0].username });
    } catch (err) {
        console.error('Error registering user:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || username.length < 3) {
        return res.status(400).json({ error: 'Invalid username' });
    }
    if (!password || typeof password !== 'string' || password.length < 3) {
        return res.status(400).json({ error: 'Invalid password' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM owners WHERE username = $1 AND password = $2',
            [username, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = result.rows[0];
        const token = jwt.sign( user.username , SECRET_KEY);
        res.json({ token });
    } catch (err) {
        console.error('Error logging in:', err);    
        res.status(500).json({ error: 'Error logging in' });
    }
});

function requireAuthMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
}

export { router as authRouter, requireAuthMiddleware };