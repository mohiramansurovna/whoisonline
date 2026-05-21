import { Redis } from 'ioredis';
import type { EnvConfig } from "./env.config.ts";

export const RedisKeys = {
    session: (sessionId: string) => `session:${sessionId}`,
    userSessions: (userId: number) => `usersessions:${userId}`,
}

export const RedisClient = {
    instance: null as Redis | null,

    async init(envConfig: EnvConfig): Promise<void> {
        this.instance = new Redis({
            host: envConfig.REDIS_HOST,
            port: envConfig.REDIS_PORT
        });

        await new Promise<void>((resolve, reject) => {
            this.instance!.once('ready', resolve)
            this.instance!.once('error', reject)
        });
    },

    get(): Redis {
        if (!this.instance) throw new Error('Redis has not been initialized. Call RedisClient.init() first.')
        return this.instance
    }
}