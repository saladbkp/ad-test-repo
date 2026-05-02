import { Pool } from 'pg';

const pool = new Pool({
    user: 'web',
    host: 'postgres',
    database: 'db',
    password: process.env.POSTGRES_WEB_PASSWORD || 'webpass',
    port: 5432,
});

export default pool;
