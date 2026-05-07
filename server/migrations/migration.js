import fs from 'fs/promises'
import { Pool } from 'pg'
import { loadEnvFile } from 'node:process';

loadEnvFile('./.env');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
console.log('Openning Database Connection\n')

async function create(file_name) {
    const timeStamp = Date.now();
    const path = './migrations/migrations/' + timeStamp + '-' + file_name + '.sql'
    const content = `--UP

--DOWN
`
    await fs.writeFile(path, content, 'utf-8');
    console.log('Created: ' + path)
}

async function initMigrationsTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT NOW()
    );
    `
    await pool.query(sql)
}
async function isTableExists() {
    const res = await pool.query(
        `SELECT to_regclass('public.migrations') as exists`
    );
    return res.rows[0].exists !== null;
}

async function isInMigrationsTable(name) {
    const sql = `SELECT id FROM migrations WHERE name=$1`
    const res = await pool.query(sql, [name])
    return res.rows.length > 0;
}

async function getSQL(type, file_name) {
    const file = await fs.readFile('./migrations/migrations/' + file_name, 'utf-8');
    const parts = file.split('--DOWN');
    return type === 'up' ? parts[0] : parts[1] || ''
}


async function up() {
    await initMigrationsTable();
    const files = await fs.readdir('./migrations/migrations', 'utf-8');

    for (const file of files) {
        if (!(await isInMigrationsTable(file))) {
            const query = await getSQL('up', file);
            await pool.query(query);
            await pool.query(`INSERT INTO migrations(name) VALUES ($1)`, [file]);
            console.log('Executed UP Migration - ' + file)
        } else {
            console.log('Skipped migration - ' + file)
        }
    }
    console.log('All Migrations Up :)')

}

async function down() {
    if (!(await isTableExists())) {
        console.log('Nothing to migrate down')
    } else {
        const res = await pool.query('SELECT name FROM migrations ORDER BY id DESC');

        for (const row of res.rows) {
            const file = row.name;
            const query = await getSQL('down', file);
            await pool.query(query);
            await pool.query('DELETE FROM migrations WHERE name=$1', [file]);
            console.log('Executed DOWN Migration - ' + file);
        }
        if (res.rowCount == 0) {
            console.log('No DOWN migrations')
        }
    }
}
async function view() {
    const sql = `
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_name, ordinal_position;
    `;

    const res = await pool.query(sql);

    let currentTable = null;

    for (const row of res.rows) {
        if (row.table_name !== currentTable) {
            currentTable = row.table_name;
            console.log(`\n---- ${currentTable} TABLE ----`);
        }

        console.log(`${row.column_name} (${row.data_type})`);
    }
}
async function main() {
    try {
        const [, , command, name] = process.argv;
        switch (command) {
            case 'create':
                if (!name) {
                    console.log('Migration name required');
                    process.exit(1);
                }
                await create(name);
                break;
            case 'up':
                await up();
                break;
            case 'down':
                await down();
                break;
            case 'view':
                await view();
                break;
            default:
                console.log('Unkown command, Use create | up | down')
        }
    } catch (err) {
        console.error('Error on migration runner: ' + err)
    } finally {
        console.log('\nClosing database connection ...')
        await pool.end();
    }
}
main();