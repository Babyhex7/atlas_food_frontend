import axios, { type AxiosRequestConfig } from "axios";
import { getAccessToken } from "@/internal/lib/cookies";
import { API_BASE_URL, redirectToLogin, refreshOnce } from "@/internal/lib/authRefresh";

const BASE_URL = API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    // Kegagalan /auth/refresh sendiri tidak boleh memicu refresh lagi.
    const isRefreshCall = String(originalRequest?.url ?? "").includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;

      try {
        // refreshOnce() dibagi dengan klien fetch di internal/pkg/api/apiClient.ts.
        // Refresh token backend sekali pakai, jadi beberapa 401 berbarengan HARUS
        // berbagi satu panggilan refresh — kalau tidak, yang kalah balapan
        // membuang sesi user di tengah pengisian recall.
        const newAccessToken = await refreshOnce();
        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${newAccessToken}`,
        };
        return apiClient(originalRequest);
      } catch {
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  }
);
