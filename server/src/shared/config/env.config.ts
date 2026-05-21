import { loadEnvFile } from "node:process";
import { Schema, Validator as v, type InferSchema } from "../lib/validator.ts";

const envSchema = new Schema({
    APP_PORT: v.number(),
    
    DB_HOST: v.string(),
    DB_PORT: v.number(),
    DB_USER: v.string(),
    DB_PASSWORD: v.string(),
    DB_NAME: v.string(),
    
    REDIS_HOST: v.string(),
    REDIS_PORT: v.number(),
})
export type EnvConfig = InferSchema<typeof envSchema>
export function loadEnvConfig(){
    loadEnvFile()
    try{
        return envSchema.parse(process.env)
    }catch(err){
        console.error('Invalid ENV variables:', err instanceof Error ? err.message : err)
        process.exit(1)
    }
}