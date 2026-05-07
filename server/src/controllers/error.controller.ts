import type { IncomingMessage, ServerResponse } from "http";
import { sendResponse } from "../shared/util/sendResponse.ts";
import { HttpError } from "../shared/lib/httpError.ts";

export function errorController(req: IncomingMessage, res: ServerResponse, err: unknown): void {
    if (err instanceof HttpError) {
        sendResponse(res, err.status, err.message)
    } else {

        console.log(err)
        sendResponse(res, 500, 'Internal server error')
    }
}
