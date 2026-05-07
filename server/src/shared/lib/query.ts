import 'dotenv/config';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const requiredEnv = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`${key} is required`);
    }
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export function query<T extends QueryResultRow>(sql: string, params?: unknown[]):Promise<QueryResult<T>> {
    return pool.query<T>(sql, params);
}