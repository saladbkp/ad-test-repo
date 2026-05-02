import express from 'express';
import crypto from 'crypto';
import multer from 'multer';

import { authRouter, requireAuthMiddleware } from './auth.mjs';
import pool from './db.mjs';
import { getGroupName, isInGroup } from './utils.mjs';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(authRouter);

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.get('/airports', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM airports');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching airports:', err);
        res.status(500).json({ error: 'Error fetching airports' });
    }
});

app.get('/groups', async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM groups');
        res.json(result.rows.map(row => row.name));
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ error: 'Error fetching groups' });
    }
});

app.post('/groups', async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.length === 0 || /^[A-Z]{3,10}$/.test(name) === false) {
        return res.status(400).json({ error: 'Invalid group name' });
    }
    try {
        const token = crypto.randomBytes(8).toString('hex');
        const result = await pool.query(
            'INSERT INTO groups (name, token) VALUES ($1, $2) RETURNING name, token',
            [name, token]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating group:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Group already exists' });
        }
        res.status(500).json({ error: 'Error creating group' });
    }
});

app.get('/flights', async (req, res) => {
    try {
        const now = new Date();
        const result = await pool.query(
            'SELECT * FROM flights WHERE is_private = false AND departure < $1 AND arrival > $1',
            [now]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Error fetching flights' });
    }
});

app.get('/flights/:flightId/picture', async (req, res) => {
    const { flightId } = req.params;
    const customPic = `/app/uploads/${flightId}`;
    const defaultPic = '/app/default.png';

    fs.readFile(customPic, (err, data) => {
        if (err) {
            fs.readFile(defaultPic, (defaultErr, defaultData) => {
                if (defaultErr) {
                    console.error('Error reading default picture:', defaultErr);
                    return res.status(404).json({ error: 'Picture not found' });
                }
                res.setHeader('Content-Type', 'image/png');
                res.send(defaultData);
            });
        } else {
            res.setHeader('Content-Type', 'image/png');
            res.send(data);
        }
    });
});

// from now on, all routes require authentication
app.use(requireAuthMiddleware);

app.post('/flights', async (req, res) => {
    const { flightNumber, origin, destination, departure, arrival } = req.body;

    if (!flightNumber || typeof flightNumber !== 'string' || flightNumber.length < 3) {
        return res.status(400).json({ error: 'Invalid flight number' });
    }
    if (!origin || typeof origin !== 'string' || origin.length !== 3) {
        return res.status(400).json({ error: 'Invalid origin airport ID' });
    }
    if (!destination || typeof destination !== 'string' || destination.length !== 3) {
        return res.status(400).json({ error: 'Invalid destination airport ID' });
    }
    if (!departure || isNaN(new Date(departure).getTime())) {
        return res.status(400).json({ error: 'Invalid departure time' });
    }
    if (!arrival || isNaN(new Date(arrival).getTime())) {
        return res.status(400).json({ error: 'Invalid arrival time' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO flights (flight_number, origin, destination, departure, arrival, owner) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [flightNumber, origin, destination, departure, arrival, req.user]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating flight:', err);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Flight number already exists' });
        }
        res.status(500).json({ error: 'Error creating flight' });
    }
});

app.get('/flights/:flightId', async (req, res) => {
    const { flightId } = req.params;    
    try {
        const flightResult = await pool.query('SELECT * FROM flights WHERE id = $1 and is_private = false', [flightId]);
        if (flightResult.rows.length === 0) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        const flight = flightResult.rows[0];

        if (flight.owner === req.user || isInGroup(req.user, getGroupName(flight.owner))) {
            const cargoResult = await pool.query('SELECT * FROM sensitive_cargo WHERE flight = $1', [flightId]);
            flight.cargo = cargoResult.rows;
        }
        res.json(flight);
    } catch (err) {
        console.error('Error fetching flight:', err);
        res.status(500).json({ error: 'Error fetching flight' });
    }
});

app.post('/flights/:flightId/cargo', async (req, res) => {
    const { flightId } = req.params;
    const { description, weight, isDangerous } = req.body;

    if (!description || typeof description !== 'string' || description.length < 3) {
        return res.status(400).json({ error: 'Invalid cargo description' });
    }
    if (!weight || typeof weight !== 'number' || weight <= 0) {
        return res.status(400).json({ error: 'Invalid cargo weight' });
    }
    if (typeof isDangerous !== 'boolean') {
        return res.status(400).json({ error: 'Invalid dangerous cargo flag' });
    }
    try {
        const flightResult = await pool.query('SELECT * FROM flights WHERE id = $1', [flightId]);
        if (flightResult.rows.length === 0) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        const flight = flightResult.rows[0];

        if (flight.owner !== req.user) {
            return res.status(403).json({ error: 'Only the flight owner can add cargo' });
        }

        const result = await pool.query(
            'INSERT INTO sensitive_cargo (flight, description, weight, is_dangerous) VALUES ($1, $2, $3, $4) RETURNING *',
            [flightId, description, weight, isDangerous]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '42501') {
            return res.status(400).json({ error: 'Total cargo weight exceeds limit of 100' });
        }
        if (err.code === '22P02') { 
            return res.status(409).json({ error: 'Invalid flight ID' });
        }
        console.error('Error adding cargo:', err);
        res.status(500).json({ error: 'Error adding cargo' });
    }
});

const picStorage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        const { flightId } = req.params;
        cb(null, flightId);
    }
});
const uploadPic = multer({ 
    storage: picStorage,
    limits: { fileSize: 10 * 1024 } // 10KB
});


// Upload flight picture (authenticated, only flight owner)
app.post('/flights/:flightId/picture', async (req, res, next) => {
    const { flightId } = req.params;
    if (!flightId || isNaN(flightId)) {
        return res.status(400).json({ error: 'Invalid flight ID' });
    }
    // Check if the flight exists and belongs to the user
    try {
        const result = await pool.query('SELECT * FROM flights WHERE id = $1 AND owner = $2', [flightId, req.user]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Flight not found or you are not the owner' });
        }
        // If owner, proceed to upload
        uploadPic.single('picture')(req, res, function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            res.json({ message: 'Flight picture uploaded successfully' });
        });
    } catch (err) {
        console.error('Error checking flight ownership:', err);
        res.status(500).json({ error: 'Error checking flight ownership' });
    }
});

app.get('/my-flights', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM flights WHERE owner = $1',
            [req.user]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user flights:', err);
        res.status(500).json({ error: 'Error fetching user flights' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});