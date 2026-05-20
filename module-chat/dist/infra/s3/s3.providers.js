"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3ClientProvider = void 0;
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_tokens_1 = require("./s3.tokens");
exports.s3ClientProvider = {
    provide: s3_tokens_1.S3_CLIENT,
    useFactory: (config) => {
        const s3 = config.getOrThrow('s3');
        return new client_s3_1.S3Client({
            region: s3.region,
            credentials: {
                accessKeyId: s3.accessKeyId,
                secretAccessKey: s3.secretAccessKey,
            },
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=s3.providers.js.map