import type { IncomingMessage, ServerResponse } from "http";
import { errorController } from "./error.controller.ts";
import { notFoundController } from "./notFound.controller.ts";
import { usersService } from "../services/users.service.ts";
import { getCookie } from "../shared/util/getCookie.ts";
import { usersPresenter } from "../presenters/users.presenter.ts";
import { sendResponse } from "../shared/util/sendResponse.ts";

export async function usersController(req: IncomingMessage, res: ServerResponse, parts: string[]): Promise<void> {
    const part = parts[0];
    const method = req.method;
    try {
        switch (method) {
            case 'GET':
                if (part == 'me') {
                    await getUser(req, res)
                    break
                } else {
                    await getAllUsers(req, res)
                    break
                }
            case 'PUT':
                await updateUser(req, res)
                break

            case 'DELETE':
                await deleteUser(req, res)
                break
            default:
                notFoundController(req, res)
                break
        }

    } catch (err: unknown) {
        errorController(req, res, err)
    }
}

async function getUser(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const sessionId = getCookie(req, 'sessionId');
    if (!sessionId) {
        sendResponse(res, 400, 'No session');
        return;
    }

    const user = await usersService.getUser(sessionId);
    if (!user) {
        sendResponse(res, 404, 'User not found');
        return;
    }

    sendResponse(res, 200, usersPresenter.one(user), true)
    return;
}

async function getAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const users = await usersService.getAllUsers();
    sendResponse(res, 200, usersPresenter.many(users), true);
    return;
}

async function updateUser(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const sessionId = getCookie(req, 'sessionId');
    if (!sessionId) {
        sendResponse(res, 400, 'No session');
        return;
    }

    await usersService.updateLastSeen(sessionId);
    sendResponse(res, 200, 'User updated');
    return;
}

async function deleteUser(req: IncomingMessage, res: ServerResponse): Promise<void> {

    const sessionId = getCookie(req, 'sessionId');
    if (!sessionId) {
        sendResponse(res, 400, 'No session');
        return
    }

    await usersService.deleteUser(sessionId);
    sendResponse(res, 200, 'User deleted');
    return;
}