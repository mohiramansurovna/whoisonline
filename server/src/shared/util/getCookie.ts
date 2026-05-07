import type { IncomingMessage } from "http";

export function getCookie(req: IncomingMessage, name: string): string | undefined {
    const header = req.headers.cookie;
    if (!header) return undefined;

    const cookies = Object.fromEntries(
        header.split(";").map(c => {
            const [k, ...v] = c.trim().split("=");
            return [k, v.join("=")];
        })
    );

    return cookies[name];
}