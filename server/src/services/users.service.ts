import type { User } from "../entities/users.entity.ts";
import { usersRepository } from "../repositories/users.repository.ts";
import { HttpError } from "../shared/lib/httpError.ts";
import { sessionsService, type SessionId } from "./sessions.service.ts";
/**
 * get user
 * get all users
 * update user
 * delete user
 */
export const usersService = {
    async getUser(sessionId: SessionId): Promise<User> {
        const userId = await sessionsService.getUserIdBySessionId(sessionId);
        if (!userId) throw new HttpError('Invalid userId', 400);
        const user = await usersRepository.getById(userId);
        if (!user) throw new HttpError('User not found', 404);
        return user
    },
    async getAllUsers(): Promise<User[]> {
        const users = await usersRepository.getAll();
        return users;
    },
    async updateLastSeen(sessionId: SessionId): Promise<void> {
        const userId = await sessionsService.getUserIdBySessionId(sessionId);
        if (!userId) {
            throw new HttpError('User not found', 404)
        }
        await usersRepository.updateLastSeen(userId);
    },
    async deleteUser(sessionId: SessionId): Promise<void> {
        const userId = await sessionsService.getUserIdBySessionId(sessionId);
        if (!userId) {
            throw new HttpError('User not found', 404)
        }
        await usersRepository.delete(userId);
    }
}