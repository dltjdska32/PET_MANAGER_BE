import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server } from "socket.io";

export class RedisIoAdapter extends IoAdapter {

    private adapterConstructor: ReturnType<typeof createAdapter>;

    constructor(private app: INestApplication) {
        super(app);
    }
    
    async connToRedis() : Promise<void> {
        const url = process.env.REDIS_URL;
        
        const pub = createClient({ url }); 
        const sub = pub.duplicate(); 

        /// 병렬로 pub sub 연결
        await Promise.all([pub.connect(), sub.connect()]);

        this.adapterConstructor = createAdapter(pub, sub);

    }


    createIOSever(port: number, options?: any): Server {
        const server: Server = super.createIOServer(port, options) as Server;
        server.adapter(this.adapterConstructor);
        return server;
    }

}