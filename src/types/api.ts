export type ApiError = {
  code: string;
  message: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId?: string;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
  requestId?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ApiRequest<TPayload = Record<string, unknown>> = {
  action: string;
  payload: TPayload;
  sessionToken?: string;
};

export type HealthCheckData = {
  appName: string;
  apiVersion: string;
  timestamp: string;
};
