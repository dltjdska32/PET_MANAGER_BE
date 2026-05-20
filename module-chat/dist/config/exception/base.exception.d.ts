export declare class BaseException extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(statusCode: number, code: string, message: string);
    static badRequest(code: string, message: string): BaseException;
    static unauthorized(code: string, message: string): BaseException;
    static forbidden(code: string, message: string): BaseException;
    static notFound(code: string, message: string): BaseException;
    static conflict(code: string, message: string): BaseException;
    static internal(code: string, message: string): BaseException;
}
