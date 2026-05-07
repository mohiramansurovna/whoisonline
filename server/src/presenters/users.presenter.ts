import type { User } from "../entities/users.entity.ts"

export type UserResponce={
    id:number,
    email:string,
    lastSeen:Date
}

export const usersPresenter={
    one:(user:User):UserResponce=>{
    return {
        id:user.id,
        email:user.email,
        lastSeen:user.last_seen
    }},
    many:(users:User[]):UserResponce[]=>{
        return users.map(user=>usersPresenter.one(user))
    }
}