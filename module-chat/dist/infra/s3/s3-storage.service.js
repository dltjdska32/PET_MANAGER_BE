"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const s3_tokens_1 = require("./s3.tokens");
const s3_url_util_1 = require("./s3-url.util");
let S3StorageService = class S3StorageService {
    client;
    config;
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    s3() {
        return this.config.getOrThrow('s3');
    }
    buildPublicUrl(key) {
        const { bucket, region } = this.s3();
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
    makeObjectKey(dirName, originalName) {
        const safeName = originalName?.replace(/[/\\]/g, '_') || 'file';
        return `${dirName}/${(0, node_crypto_1.randomUUID)()}-${safeName}`;
    }
    async putBuffer(key, body, contentType) {
        const { bucket } = this.s3();
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        }));
        return this.buildPublicUrl(key);
    }
    async deleteByUrl(s3Url) {
        const key = (0, s3_url_util_1.extractKeyFromS3Url)(s3Url);
        const { bucket } = this.s3();
        await this.client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
    }
};
exports.S3StorageService = S3StorageService;
exports.S3StorageService = S3StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(s3_tokens_1.S3_CLIENT)),
    __metadata("design:paramtypes", [client_s3_1.S3Client,
        config_1.ConfigService])
], S3StorageService);
//# sourceMappingURL=s3-storage.service.js.map