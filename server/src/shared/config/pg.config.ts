import { Pool, type QueryResult, type QueryResultRow } from "pg";
import type { EnvConfig } from "./env.config.ts";

export const PgClient = {
    instance: null as Pool | null,
    async init(envConfig: EnvConfig): Promise<void> {
        this.instance = new Pool({
            host: envConfig.DB_HOST,
            port: envConfig.DB_PORT,
            user: envConfig.DB_USER,
            password: envConfig.DB_PASSWORD,
            database: envConfig.DB_NAME
        })
        await this.instance.query('SELECT 1')
    },
    get(): Pool {
        if (!this.instance) throw new Error('PgPool has not been initialized. Call initPgPool() first.')

        return this.instance
    },
    query <T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
        const pool=this.get()
        return pool.query<T>(sql, params);
    }
}