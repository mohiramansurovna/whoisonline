import { HttpError } from "../lib/httpError.ts";
import type { InferSchema, Schema } from "../lib/validator.ts";

export function parseBody<T extends Record<string, any>>(schema: Schema<T>, json: string): InferSchema<Schema<T>> {
    try {
        const data = JSON.parse(json);
        return schema.parse(data)
    } catch (err) {
        throw new HttpError(
            `Invalid request body: ${err instanceof Error ? err.message : err}`,
            400
        )   
    }
}