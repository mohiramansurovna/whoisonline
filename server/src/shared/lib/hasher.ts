import {scrypt, randomBytes} from 'crypto'
import { promisify } from 'util'

const scryptAsync=promisify(scrypt);

export const Hasher={
    hashPassword:async (value:string):Promise<string>=>{
        const salt=randomBytes(16).toString('hex');
        const hash=await scryptAsync(value, salt, 64) as Buffer;

        return `${salt}:${hash.toString('hex')}`
    },
    verifyPassword:async (value:string, hash:string):Promise<boolean>=>{
        const parts=hash.split(':');

        if(parts.length!==2){
            return false;
        }
        const salt=parts[0] as string;
        const hashed_value=(await scryptAsync(value,salt,64) as Buffer).toString('hex');

        return hashed_value===parts[1];
    }
}