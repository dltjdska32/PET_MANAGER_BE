import type { IncomingHttpHeaders } from 'http';
import type { BasicUserInfo } from './basic-user-info';
export declare function parseBasicUserFromHeaders(headers: IncomingHttpHeaders): BasicUserInfo | undefined;
