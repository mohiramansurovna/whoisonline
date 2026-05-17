import { Schema, Validator as v } from "../lib/validator.ts";

const envSchema = new Schema({
    APP_PORT: new v().number(),

    DB_HOST: new v().string(),
    DB_PORT: new v().string(),
    DB_USER: new v().string(),
    DB_PASSWORD: new v().string(),
    DB_NAME: new v().string(),

    REDIS_HOST: new v().string(),
    REDIS_PORT: new v().number(),
})




export function envValidator(){
    try{
        return envSchema.validateSchema(process.env)
    }catch(err){
        console.log('Invalid ENV Variables......')
        console.log(err)
        process.exit(1)
    }
}