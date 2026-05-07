import { usersRepository } from "../repositories/users.repository.ts";
import { Hasher } from "../shared/lib/hasher.ts";
import { HttpError } from "../shared/lib/httpError.ts";
import { sessionsService, type SessionId } from "./sessions.service.ts";
import { socketsService } from "./sockets.service.ts";

export const authService={
    register: async (email:string, password:string):Promise<void>=>{
        const existingUser=await usersRepository.getByEmail(email);
        if(existingUser){
            throw new HttpError('User already exists',409)
        }
        const password_hash=await Hasher.hashPassword(password)
        const user=await usersRepository.create(email, password_hash);
        if(!user) throw new HttpError('User not created',500)
    },

    login: async (email:string, password:string):Promise<string>=>{
        const user=await usersRepository.getByEmail(email);
        if(!user) throw new HttpError('Invalid email or password', 401)
        
        const isValidPassword=await Hasher.verifyPassword(password, user.password)
        if(!isValidPassword) throw new HttpError('Invalid email or password',401)
        
        const sessionId=await sessionsService.createSession(user.id);
        return sessionId;
    },

    logout: async (sessionId:SessionId):Promise<void>=>{
        const userId=await sessionsService.getUserIdBySessionId(sessionId);
        if(!userId) throw new HttpError('Invalid session, cannot logout',400);

        await sessionsService.deleteSession(sessionId, userId);
        socketsService.removeAllUserSockets(userId);
    }
}