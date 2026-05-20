import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
export declare const s3ClientProvider: {
    provide: symbol;
    useFactory: (config: ConfigService) => S3Client;
    inject: (typeof ConfigService)[];
};
