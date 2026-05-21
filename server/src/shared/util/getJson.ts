import { HttpError } from "../lib/httpError.ts";

type JsonResult = {
    [key: string]: any
}
export function getJson(parseKeys: string[], data: string): JsonResult {
    const parsedData = JSON.parse(data);
    const result: JsonResult = {}
    try {

        for (const key of parseKeys) {
            result[key] = parsedData[key]
        }
        return result
    } catch {
        throw new HttpError(`Wrong JSON format, expected values :\n ${parseKeys.join('\n')}`, 400)
    }
}