import type { ServerResponse } from "http";

export function sendResponse(res: ServerResponse,statusCode:number,data?:unknown, isJson: boolean=false): void {
    res.statusCode = statusCode;
    
    if (data) {
        if (isJson) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data))
        } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(String(data))
        }
    } else {
        res.end();
    }
}
