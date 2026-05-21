import { randomUUID } from 'crypto';
import { RedisClient, RedisKeys } from '../shared/config/redis.config.ts';

export type SessionId = string;
type UserId = number;

// const sessions = new Map<SessionId, UserId>();
// const userSessions = new Map<UserId, Set<SessionId>>();

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export const sessionsService = {
    async createSession(userId: UserId): Promise<SessionId> {
        const redis = RedisClient.get()

        const sessionId: SessionId = randomUUID();

        await redis.pipeline()
            .set(RedisKeys.session(sessionId), String(userId), 'EX', SESSION_TTL)
            .sadd(RedisKeys.userSessions(userId), sessionId)
            .expire(RedisKeys.userSessions(userId), SESSION_TTL)
            .exec()

        return sessionId;
    },

    async getUserIdBySessionId(sessionId: SessionId): Promise<UserId | null> {
        const redis = RedisClient.get()

        const userId = await redis.get(RedisKeys.session(sessionId));
        return userId ? Number(userId) : null;
    },

    async deleteSession(sessionId: SessionId, userId: UserId): Promise<void> {
        const redis = RedisClient.get()

        await redis.pipeline()
            .del(RedisKeys.session(sessionId))
            .srem(RedisKeys.userSessions(userId), sessionId)
            .exec()
    },
};