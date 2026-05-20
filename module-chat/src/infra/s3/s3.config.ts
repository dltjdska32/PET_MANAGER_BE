import { registerAs } from '@nestjs/config';

/** module-feed `application.yml` 의 `cloud.aws` / 환경변수와 동일 키 */
export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export default registerAs(
  's3',
  (): S3Config => ({
    region: process.env.AWS_REGION ?? 'ap-northeast-2',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_CREDENTIALS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.AWS_CREDENTIALS_SECRET_KEY ?? '',
  }),
);
