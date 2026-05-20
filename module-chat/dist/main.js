"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const redis_io_adapter_1 = require("./infra/redis-pub-sub/redis-io.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    app.setGlobalPrefix('api/chat');
    await app.listen(8083);
}
void bootstrap();
//# sourceMappingURL=main.js.map