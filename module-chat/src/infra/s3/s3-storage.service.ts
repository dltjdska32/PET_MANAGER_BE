import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { S3Config } from './s3.config';
import { S3_CLIENT } from './s3.tokens';
import { extractKeyFromS3Url } from './s3-url.util';

/**
 * 채팅 모듈 파일 업로드용 S3 래퍼.
 * 피드 `S3ImgUploader.buildS3Url` 과 동일한 공개 URL 형식을 사용합니다.
 */
@Injectable()
export class S3StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {}

  private s3(): S3Config {
    return this.config.getOrThrow<S3Config>('s3');
  }

  buildPublicUrl(key: string): string {
    const { bucket, region } = this.s3();
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  /** `dirName/originalName` 형태 키 생성 (피드 업로더와 동일 패턴) */
  makeObjectKey(dirName: string, originalName: string | undefined): string {
    const safeName = originalName?.replace(/[/\\]/g, '_') || 'file';
    return `${dirName}/${randomUUID()}-${safeName}`;
  }

  async putBuffer(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const { bucket } = this.s3();
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return this.buildPublicUrl(key);
  }

  async deleteByUrl(s3Url: string): Promise<void> {
    const key = extractKeyFromS3Url(s3Url);
    const { bucket } = this.s3();
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}
