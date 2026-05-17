export class HttpError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}