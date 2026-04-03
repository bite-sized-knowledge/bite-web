export interface ApiErrorResult {
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  result: T | ApiErrorResult | null;
}
