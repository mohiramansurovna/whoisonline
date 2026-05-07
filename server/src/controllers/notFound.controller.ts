import type { IncomingMessage, ServerResponse } from "http";
import { sendResponse } from "../shared/util/sendResponse.ts";

export function notFoundController(req: IncomingMessage, res: ServerResponse): void {
    sendResponse(res, 404, 'Not found')
}
