import { Slice } from "./slice";
export declare class ApiResponse<T> {
    readonly statusCode: number;
    readonly code: string;
    readonly message: string;
    readonly value: T | null;
    constructor(statusCode: number, code: string, message: string, value: T | null);
    static ok(): ApiResponse<null>;
    static ok<T>(value: T): ApiResponse<T>;
    static okWithStatus<T>(statusCode: number, value: T): ApiResponse<T>;
    static error(statusCode: number, code: string, message: string): ApiResponse<null>;
    static pagination<T>(val: Slice<T>): ApiResponse<Slice<T>>;
}
