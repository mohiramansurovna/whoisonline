import type { IncomingMessage } from "node:http";
import { HttpError } from "../lib/httpError.ts";

export function readBody(req: IncomingMessage, maxSize = 1024 * 100): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;

        req.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > maxSize) {
                reject(new HttpError('Request body too large', 413));
                req.socket.destroy();
                return;
            }
            body += chunk.toString();
        });

        req.on('end', () => resolve(body));
        req.on('error', () => reject(new HttpError('Invalid request body', 400)));
    });
}