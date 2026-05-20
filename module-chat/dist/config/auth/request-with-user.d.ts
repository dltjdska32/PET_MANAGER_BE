import type { Request } from 'express';
import type { BasicUserInfo } from './basic-user-info';
export type RequestWithUser = Request & {
    user?: BasicUserInfo;
};
