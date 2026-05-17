import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt);

export const Hasher = {
    hashPassword: async (value: string): Promise<string> => {
        const salt = randomBytes(16).toString('hex');
        const hash = await scryptAsync(value, salt, 64) as Buffer;

        return `${salt}:${hash.toString('hex')}`
    },
    verifyPassword: async (value: string, storedHash: string): Promise<boolean> => {
        const [salt, expectedHashHex] = storedHash.split(':');

        if (!salt || !expectedHashHex) return false;
             
        const generatedHashBuffer = await scryptAsync(value, salt, 64) as Buffer;
        const expectedHashBuffer=Buffer.from(expectedHashHex,'hex');

        if(expectedHashBuffer.length!==generatedHashBuffer.length){
            return false
        }
        return timingSafeEqual(expectedHashBuffer,generatedHashBuffer)
    }
}