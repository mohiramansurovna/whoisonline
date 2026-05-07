// src/ws/ws.ts
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { IncomingMessage } from 'http';
import { getCookie } from './shared/util/getCookie.ts';
import { sessionsService } from './services/sessions.service.ts';
import { socketsService } from './services/sockets.service.ts';

const HEARTBEAT_INTERVAL = 30_000;

export interface AuthenticatedWebSocket extends WebSocket {
    isAlive: boolean;
}

type UserPresenceEvent =
    | { type: "USER_ONLINE"; userId: number }
    | { type: "USER_OFFLINE"; userId: number }
    | { type: "INIT"; onlineUsers: number[] }

function broadcastStatus(wss: WebSocketServer, payload: UserPresenceEvent) {
    for (const ws of wss.clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    }
}

export function initWebSocketServer(server: Server): void {
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
        try {
            ws.isAlive = true;
            ws.on("pong", () => { ws.isAlive = true; });

            const sessionId = getCookie(req, "sessionId");
            if (!sessionId) { ws.close(); return; }

            const userId = await sessionsService.getUserIdBySessionId(sessionId);
            if (!userId) { ws.close(); return; }

            socketsService.addSocket(userId, ws);
            ws.send(JSON.stringify({ type: "INIT", onlineUsers: socketsService.getOnlineUserIds() }));
            broadcastStatus(wss, { type: "USER_ONLINE", userId });

            ws.on("message", (message) => {
                console.log("received:", message.toString());
            });

            ws.on("error", (err) => {
                console.error("WebSocket error:", err);
            });

            ws.on("close", () => {
                socketsService.removeSocket(userId, ws);
                if (!socketsService.isUserOnline(userId)) {
                    broadcastStatus(wss, { type: "USER_OFFLINE", userId });
                }
            });
        } catch (err) {
            console.error('WebSocket connection error:', err);
            ws.close();
        }
    });

    const heartbeat = setInterval(() => {
        wss.clients.forEach((ws) => {
            const socket = ws as AuthenticatedWebSocket;
            if (!socket.isAlive) { socket.terminate(); return; }
            socket.isAlive = false;
            socket.ping();
        });
    }, HEARTBEAT_INTERVAL);

    server.on("close", () => clearInterval(heartbeat));
}