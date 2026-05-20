import { Slice } from "./slice";

export class ApiResponse<T> {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly message: string,
    public readonly value: T | null,
  ) {}

  static ok(): ApiResponse<null>;
  static ok<T>(value: T): ApiResponse<T>;
  static ok<T>(value?: T): ApiResponse<T | null> {
    if (value === undefined) {
      return new ApiResponse(200, 'SUCCESS', 'ok', null);
    }
    return new ApiResponse(200, 'SUCCESS', 'ok', value);
  }

  static okWithStatus<T>(statusCode: number, value: T): ApiResponse<T> {
    return new ApiResponse(statusCode, 'SUCCESS', 'ok', value);
  }

  static error(statusCode: number, code: string, message: string): ApiResponse<null> {
    return new ApiResponse(statusCode, code, message, null);
  }

  static pagination<T>(val : Slice<T>): ApiResponse<Slice<T>> {
    return new ApiResponse(200, 'SUCCESS', 'ok', val);
  }

}
