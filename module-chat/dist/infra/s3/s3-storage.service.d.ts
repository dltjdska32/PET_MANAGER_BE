import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
export declare class S3StorageService {
    private readonly client;
    private readonly config;
    constructor(client: S3Client, config: ConfigService);
    private s3;
    buildPublicUrl(key: string): string;
    makeObjectKey(dirName: string, originalName: string | undefined): string;
    putBuffer(key: string, body: Buffer, contentType: string): Promise<string>;
    deleteByUrl(s3Url: string): Promise<void>;
}
