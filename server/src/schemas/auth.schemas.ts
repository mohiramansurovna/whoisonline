import { Schema, Validator as v } from "../shared/lib/validator.ts"

export const registerSchema = new Schema({
    email: v.string(),
    password: v.string(),
})
export const loginSchema = new Schema({
    email: v.string(),
    password: v.string(),
})