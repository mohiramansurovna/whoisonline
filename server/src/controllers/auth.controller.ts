import type { IncomingMessage, ServerResponse } from "http";
import { authService } from "../services/auth.service.ts";
import { notFoundController } from "./notFound.controller.ts";
import { errorController } from "./error.controller.ts";
import { getCookie } from "../shared/util/getCookie.ts";
import { sendResponse } from "../shared/util/sendResponse.ts";
import { HttpError } from "../shared/lib/httpError.ts";
import { readBody } from "../shared/util/readBody.ts";
import { getJson } from "../shared/util/getJson.ts";



export async function authController(req: IncomingMessage, res: ServerResponse, parts: string[]): Promise<void> {
    const part = parts[0];
    try {
        switch (part) {
            case 'register':
                await register(req, res)
                break
            case 'login':
                await login(req, res)
                break
            case 'logout':
                await logout(req, res)
                break
            default:
                notFoundController(req, res)
                break
        }
    } catch (err: unknown) {
        errorController(req, res, err)
    }
}

async function register(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const body = await readBody(req);
    const { email, password } = getJson(['email', 'password'], body)

    //email is not validated for simplicity, but should be in real app

    await authService.register(email, password);
    sendResponse(res, 201, 'User registered')

}
async function login(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await readBody(req)
    const { email, password } = getJson(['email', 'password'], body)

    const sessionId = await authService.login(email, password);
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; Path=/`);

    sendResponse(res, 200, 'User logged in')
}


async function logout(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const sessionId = getCookie(req, 'sessionId');
    if (!sessionId) throw new HttpError('Invalid session', 401);

    await authService.logout(sessionId);
    res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/');
    sendResponse(res, 200)
}
