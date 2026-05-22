import type { IncomingMessage, ServerResponse } from 'http';
import { getCookie } from '../shared/util/getCookie.ts';
import { sessionsService } from '../services/sessions.service.ts';
import { sseService } from '../services/sse.service.ts';

export async function eventsController(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    try {
        const sessionId = getCookie(req, 'sessionId');
        if (!sessionId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        const userId = await sessionsService.getUserIdBySessionId(sessionId);
        if (!userId) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        sseService.addClient(userId, res);

        const onlineUsers = sseService.getOnlineUserIds();
        res.write(`data: ${JSON.stringify({ type: 'INIT', onlineUsers })}\n\n`);

        sseService.broadcastStatus({ type: 'USER_ONLINE', userId });

        req.on('close', () => {
            sseService.removeClient(userId, res);
            if (!sseService.isUserOnline(userId)) {
                sseService.broadcastStatus({ type: 'USER_OFFLINE', userId });
            }
        });

        req.on('error', (err) => {
            console.error('SSE connection error:', err);
            sseService.removeClient(userId, res);
        });

    } catch (err) {
        console.error('SSE controller error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
}
