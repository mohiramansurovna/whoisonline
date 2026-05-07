import { randomUUID } from 'crypto';
import {Redis} from 'ioredis';
export type SessionId = string;
type UserId = number;

// const sessions = new Map<SessionId, UserId>();
// const userSessions = new Map<UserId, Set<SessionId>>();

const redis = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379')
});


const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export const sessionsService = {
    createSession: async (userId: UserId): Promise<SessionId> => {
        const sessionId: SessionId = randomUUID();

        await redis.set(`session:${sessionId}`, userId, 'EX', SESSION_TTL);
        await redis.sadd(`usersessions:${userId}`, sessionId);
        await redis.expire(`usersessions:${userId}`, SESSION_TTL);

        return sessionId;
    },

    getUserIdBySessionId: async (sessionId: SessionId): Promise<UserId | null> => {
        const userId = await redis.get(`session:${sessionId}`);
        return userId ?Number(userId): null;
    },

    deleteSession:async (sessionId: SessionId, userId: UserId): Promise<void> => {
        await redis.del(`session:${sessionId}`);
        await redis.srem(`usersessions:${userId}`, sessionId);

        const remaining = await redis.scard(`usersessions:${userId}`);
        if (remaining === 0) {
            await redis.del(`usersessions:${userId}`);
        }
    },
};