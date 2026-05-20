"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    app;
    adapterConstructor;
    constructor(app) {
        super(app);
        this.app = app;
    }
    async connToRedis() {
        const url = process.env.REDIS_URL;
        const pub = (0, redis_1.createClient)({ url });
        const sub = pub.duplicate();
        await Promise.all([pub.connect(), sub.connect()]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pub, sub);
    }
    createIOSever(port, options) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map