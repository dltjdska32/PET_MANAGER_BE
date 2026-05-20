import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import type { S3Config } from './s3.config';
import { S3_CLIENT } from './s3.tokens';

export const s3ClientProvider = {
  provide: S3_CLIENT,
  useFactory: (config: ConfigService) => {
    const s3 = config.getOrThrow<S3Config>('s3');
    return new S3Client({
      region: s3.region,
      credentials: {
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
      },
    });
  },
  inject: [ConfigService],
};
