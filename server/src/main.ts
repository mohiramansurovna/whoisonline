import http, { IncomingMessage, ServerResponse } from 'http';
import { notFoundController } from './controllers/notFound.controller.ts';
import { usersController } from './controllers/users.controller.ts';
import { errorController } from './controllers/error.controller.ts';
import { authController } from './controllers/auth.controller.ts';
import { setCors } from './shared/util/setCors.ts';
import { sendResponse } from './shared/util/sendResponse.ts';
import { initWebSocketServer } from './ws.ts';
import { envValidator } from './shared/util/envValidator.ts';

const values=envValidator();
function getUrlSegments(url: string): string[] {
    return url.split('/').filter(Boolean)
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        return sendResponse(res, 400);
    }

    const segments = getUrlSegments(req.url)
    setCors(res);
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200)
    }
    try {
        const [rootSegment, ...rest] = segments
        switch (rootSegment) {
            case 'users': return usersController(req, res, rest);
            case 'auth': return authController(req, res, rest);
            default: return notFoundController(req, res);
        }
    } catch (err: unknown) {
        return errorController(req, res, err)
    }
})

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1)

});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1)
});

initWebSocketServer(server);

server.listen(5000, () => console.log(`Server running at http://localhost:${values.APP_PORT}/`));