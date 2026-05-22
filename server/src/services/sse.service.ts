import type { ServerResponse } from 'http';

type UserId = number;

const userClients = new Map<UserId, Set<ServerResponse>>();

export type UserPresenceEvent =
    | { type: "USER_ONLINE"; userId: number }
    | { type: "USER_OFFLINE"; userId: number }
    | { type: "INIT"; onlineUsers: number[] }

export const sseService = {
    addClient(userId: UserId, res: ServerResponse): void {
        if (!userClients.has(userId)) {
            userClients.set(userId, new Set());
        }
        userClients.get(userId)!.add(res);
    },

    removeClient(userId: UserId, res: ServerResponse): void {
        const clients = userClients.get(userId);
        if (clients) {
            clients.delete(res);
            if (clients.size === 0) {
                userClients.delete(userId);
            }
        }
    },

    removeAllUserClients(userId: UserId): void {
        const clients = userClients.get(userId);
        if (clients) {
            for (const res of clients) {
                res.end();
            }
            userClients.delete(userId);
        }
    },

    isUserOnline(userId: UserId): boolean {
        const clients = userClients.get(userId);
        return !!clients && clients.size > 0;
    },

    getOnlineUserIds(): UserId[] {
        return Array.from(userClients.keys());
    },

    broadcastStatus(payload: UserPresenceEvent): void {
        const message = `data: ${JSON.stringify(payload)}\n\n`;
        for (const clients of userClients.values()) {
            for (const res of clients) {
                if (!res.writableEnded) {
                    res.write(message);
                }
            }
        }
    }
};
