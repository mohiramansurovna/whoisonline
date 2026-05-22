
import http from 'http';
import { notFoundController } from '../../controllers/notFound.controller.ts';
import { usersController } from '../../controllers/users.controller.ts';
import { errorController } from '../../controllers/error.controller.ts';
import { authController } from '../../controllers/auth.controller.ts';
import { eventsController } from '../../controllers/sse.controller.ts';
import { setCors } from '../util/setCors.ts';
import { sendResponse } from '../util/sendResponse.ts';
function getUrlSegments(url: string): string[] {
    return url.split('/').filter(Boolean)
}

export function createHttpServer() {
    const server = http.createServer(async (req, res) => {
        try {
            if (!req.url) {
                return sendResponse(res, 400);
            }

            const segments = getUrlSegments(req.url)

            setCors(res);
            if (req.method === 'OPTIONS') {
                return sendResponse(res, 200)
            }
            const [rootSegment, ...rest] = segments
            switch (rootSegment) {
                case 'users': return usersController(req, res, rest);
                case 'auth': return authController(req, res, rest);
                case 'events': return eventsController(req, res);
                default: return notFoundController(req, res);
            }
        } catch (err: unknown) {
            return errorController(req, res, err)
        }
    })
    return server
}