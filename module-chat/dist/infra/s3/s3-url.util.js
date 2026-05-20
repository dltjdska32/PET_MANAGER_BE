"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeyFromS3Url = extractKeyFromS3Url;
const S3_HOST_MARKER = '.amazonaws.com/';
function extractKeyFromS3Url(s3Url) {
    const idx = s3Url.lastIndexOf(S3_HOST_MARKER);
    if (idx === -1) {
        throw new Error('지원하지 않는 S3 URL 형식입니다.');
    }
    return s3Url.substring(idx + S3_HOST_MARKER.length);
}
//# sourceMappingURL=s3-url.util.js.map