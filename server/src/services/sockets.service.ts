
import { type WebSocket } from 'ws';
type UserId = number;

const userSockets = new Map<UserId, Set<WebSocket>>();

export const socketsService = {
    addSocket: (userId: UserId, ws: WebSocket): void => {
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId)?.add(ws);
    },

    removeSocket: (userId: UserId, ws: WebSocket): void => {
        const sockets = userSockets.get(userId);
        if (sockets) {
            sockets.delete(ws);
            if (sockets.size === 0) {
                userSockets.delete(userId);
            }
        }
    },

    removeAllUserSockets: (userId: UserId): void => {
        const sockets = userSockets.get(userId);
        if (sockets) {
            for (const ws of sockets) {
                ws.close();
            }
            userSockets.delete(userId);
        }
    },


    getAllSockets(): WebSocket[] {
        const sets = Array.from(userSockets.values());
        const sockets = []
        for (const set of sets) {
            sockets.push(...set);
        }
        return sockets;
    },

    isUserOnline: (userId: UserId): boolean => {
        const sockets = userSockets.get(userId);
        return !!sockets && sockets.size > 0;
    },

    getOnlineUserIds: (): UserId[] => {
        return Array.from(userSockets.keys());
    }
};