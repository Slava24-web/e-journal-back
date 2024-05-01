import { Response } from "express"

class WebError {
    private status: number
    private error: unknown

    constructor(status: number, error: unknown) {
        this.status = status;
        this.error = error;
    }
}

export class Unprocessable extends WebError {
    constructor(error: unknown) {
        super(422, error);
    }
}

export class Conflict extends WebError {
    constructor(error: unknown) {
        super(409, error);
    }
}

export class NotFound extends WebError {
    constructor(error: unknown) {
        super(404, error);
    }
}

export class Forbidden extends WebError {
    constructor(error: unknown) {
        super(403, error);
    }
}

export class Unauthorized extends WebError {
    constructor(error: unknown) {
        super(401, error);
    }
}

export class BadRequest extends WebError {
    constructor(error: unknown) {
        super(400, error);
    }
}

class ErrorUtils {
    static catchError(res: Response, error: unknown) {
        console.log(error);
        // @ts-ignore
        return res.status(error.status || 500).json(error);
    }
}

export default ErrorUtils;