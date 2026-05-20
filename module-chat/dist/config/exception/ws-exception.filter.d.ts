import { ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
export declare const WS_EXCEPTION_EVENT = "WS_ERR_EVENT";
type WsExceptionLogger = Pick<Logger, 'warn' | 'error'>;
export declare function emitWsException(client: Socket, exception: unknown, logger?: WsExceptionLogger): void;
export declare class WsExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
export {};
