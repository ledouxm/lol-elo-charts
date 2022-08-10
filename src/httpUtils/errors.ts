export class HTTPError extends Error {
    code: number;
    response: any;

    constructor(error: string, code = 500, additionnalParams = {}) {
        super(`An HTTP ${code} error has occured`);
        this.response = { error, ...additionnalParams };
        this.code = code;
    }
}

export class UnauthenticatedUser extends HTTPError {
    constructor() {
        super("Unauthenticated user", 401);
    }
}

export class NoAccessToken extends HTTPError {
    constructor() {
        super("No access_token provided", 401);
    }
}

export class InvalidAccessToken extends HTTPError {
    constructor() {
        super("Invalid access_token provided", 401);
    }
}
