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
export const usersService={
    getUser:async(sessionId:SessionId):Promise<User>=>{
        const userId=await sessionsService.getUserIdBySessionId(sessionId);
        if(!userId) throw new HttpError('Invalid userId',400);
        const user= await usersRepository.getById(userId);
        if(!user) throw new HttpError('User not found',404);
        return user
    },
    getAllUsers:async():Promise<User[]>=>{
        const users = await usersRepository.getAll();
        return users;
    },
    
    updateLastSeen:async(sessionId:SessionId):Promise<void>=>{
        const userId=await sessionsService.getUserIdBySessionId(sessionId);
        if(!userId){
            throw new HttpError('User not found',404)
        }
        await usersRepository.updateLastSeen(userId);
    },
    deleteUser:async(sessionId:SessionId):Promise<void>=>{
        const userId=await sessionsService.getUserIdBySessionId(sessionId);
        if(!userId){
            throw new HttpError('User not found',404)
        }
        await usersRepository.delete(userId);
    }
}