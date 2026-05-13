export type ApiResponse<T> = {
  status: "success" | "error";
  data?: T;
  error?: ApiErrorInfo;
};

export type ApiErrorInfo = {
  code: string;
  message: string;
};

export type ApiErrorResponse = ApiResponse<never>;
