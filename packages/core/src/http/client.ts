import type { AxiosInstance } from "axios";
import axios from "axios";

export interface HttpClientConfig {
  baseURL: string;
  /** Called before each request to get auth headers */
  getAuthHeaders?: () =>
    | Record<string, string>
    | Promise<Record<string, string>>;
  timeout?: number;
}

export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 10_000,
  });

  // Inject auth headers if provided
  if (config.getAuthHeaders) {
    instance.interceptors.request.use(async (reqConfig) => {
      const headers = await config.getAuthHeaders!();
      Object.assign(reqConfig.headers, headers);
      return reqConfig;
    });
  }

  // Normalize error responses
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          error.message;
        return Promise.reject(new Error(message));
      }
      return Promise.reject(error);
    },
  );

  return instance;
}
