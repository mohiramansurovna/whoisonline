import http, { IncomingMessage, ServerResponse } from 'http';
import { notFoundController } from './controllers/notFound.controller.ts';
import { usersController } from './controllers/users.controller.ts';
import { errorController } from './controllers/error.controller.ts';
import { authController } from './controllers/auth.controller.ts';
import { setCors } from './shared/util/setCors.ts';
import { sendResponse } from './shared/util/sendResponse.ts';
import { initWebSocketServer } from './ws.ts';

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const parts = req.url?.split('/').filter(Boolean) ?? []
    setCors(res);
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200)
    }
    try {
        const [part, ...rest] = parts
        switch (part) {
            case 'users': return usersController(req, res, rest);
            case 'auth': return authController(req, res, rest);
            default: return notFoundController(req, res);
        }
    } catch (err: unknown) {
        return errorController(req, res, err)
    }
})

process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

server.listen(3000, () => console.log('Server running at http://localhost:3000/'));

initWebSocketServer(server);