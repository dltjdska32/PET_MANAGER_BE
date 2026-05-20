import { BaseException } from './base.exception';
export declare class ChatException extends BaseException {
    constructor(statusCode: number, code: string, message: string);
    static badRequest(message: string): ChatException;
    static roomNotFound(message: string): ChatException;
    static UNAUTHORIZED(message: string): ChatException;
}
