export interface S3Config {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}
declare const _default: (() => S3Config) & import("@nestjs/config").ConfigFactoryKeyHost<S3Config>;
export default _default;
