import { usersRepository } from "../repositories/users.repository.ts";
import { Hasher } from "../shared/lib/hasher.ts";
import { HttpError } from "../shared/lib/httpError.ts";
import { sessionsService, type SessionId } from "./sessions.service.ts";
import { sseService } from "./sse.service.ts";

export const authService = {
    async register(email: string, password: string): Promise<void> {
        const existingUser = await usersRepository.getByEmail(email);
        if (existingUser) throw new HttpError('User already exists', 409)

        const password_hash = await Hasher.hashPassword(password)
        await usersRepository.create(email, password_hash);
    },

    async login(email: string, password: string): Promise<string> {
        const user = await usersRepository.getByEmail(email);
        if (!user) throw new HttpError('Invalid email or password', 401)

        const isValidPassword = await Hasher.verifyPassword(password, user.password)
        if (!isValidPassword) throw new HttpError('Invalid email or password', 401)

        const sessionId = await sessionsService.createSession(user.id);
        return sessionId;
    },

    async logout(sessionId: SessionId): Promise<void> {
        const userId = await sessionsService.getUserIdBySessionId(sessionId);
        if (!userId) throw new HttpError('Invalid session', 401);

        await sessionsService.deleteSession(sessionId, userId);
        sseService.removeAllUserClients(userId);
    }
}