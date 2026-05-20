import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server } from "socket.io";
export declare class RedisIoAdapter extends IoAdapter {
    private app;
    private adapterConstructor;
    constructor(app: INestApplication);
    connToRedis(): Promise<void>;
    createIOSever(port: number, options?: any): Server;
}
