const S3_HOST_MARKER = '.amazonaws.com/';

/** `S3ImgUploader`(Java) 와 동일: 표준 가상 호스팅 스타일 URL에서 object key 추출 */
export function extractKeyFromS3Url(s3Url: string): string {
  const idx = s3Url.lastIndexOf(S3_HOST_MARKER);
  if (idx === -1) {
    throw new Error('지원하지 않는 S3 URL 형식입니다.');
  }
  return s3Url.substring(idx + S3_HOST_MARKER.length);
}
