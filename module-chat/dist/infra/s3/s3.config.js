"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('s3', () => ({
    region: process.env.AWS_REGION ?? 'ap-northeast-2',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_CREDENTIALS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.AWS_CREDENTIALS_SECRET_KEY ?? '',
}));
//# sourceMappingURL=s3.config.js.map