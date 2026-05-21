import type { IncomingMessage, ServerResponse } from "http";
import { errorController } from "./error.controller.ts";
import { notFoundController } from "./notFound.controller.ts";
import { usersService } from "../services/users.service.ts";
import { getCookie } from "../shared/util/getCookie.ts";
import { usersPresenter } from "../presenters/users.presenter.ts";
import { sendResponse } from "../shared/util/sendResponse.ts";
import { HttpError } from "../shared/lib/httpError.ts";

export async function usersController(req: IncomingMessage, res: ServerResponse, parts: string[]): Promise<void> {
    const part = parts[0];
    const method = req.method;
    try {
        switch (method) {
            case 'GET': {
                if (part === 'me') {
                    await getUser(req, res)
                } else {
                    await getAllUsers(req, res)
                }
                break;
            }
            case 'PUT': {
                await updateUser(req, res)
                break
            }

            case 'DELETE': {
                await deleteUser(req, res)
                break
            }
            default: {
                notFoundController(req, res)
            }
        }

    } catch (err: unknown) {
        errorController(req, res, err)
    }
}

async function getUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const sessionId = getSession(req)

    const user = await usersService.getUser(sessionId);
    if (!user) {
        sendResponse(res, 404, 'User not found');
        return;
    }

    sendResponse(res, 200, usersPresenter.one(user), true)
}

async function getAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const users = await usersService.getAllUsers();
    sendResponse(res, 200, usersPresenter.many(users), true);
}

async function updateUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const sessionId = getSession(req)
    await usersService.updateLastSeen(sessionId);
    sendResponse(res, 200, 'User updated');
}

async function deleteUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const sessionId = getSession(req)

    await usersService.deleteUser(sessionId);
    sendResponse(res, 200, 'User deleted');
}

function getSession(req: IncomingMessage): string {
    const sessionId = getCookie(req, 'sessionId');

    if (!sessionId) throw new HttpError('No session', 401)

    return sessionId
}