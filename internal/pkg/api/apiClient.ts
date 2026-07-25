import type { ApiResponse } from "../utils/response";
import { getAccessToken } from "@/internal/lib/cookies";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/v1";

export const API_ASSET_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

type RequestOptions = RequestInit & {
  token?: string;
};

async function parseResponse<T>(response: Response, requestPath?: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || payload?.status === "error") {
    const fromApi = payload?.error?.message;
    if (fromApi) throw new Error(fromApi);

    if (response.status === 404) {
      throw new Error(
        requestPath
          ? `Endpoint tidak ditemukan (${requestPath}). Pastikan backend sudah di-restart.`
          : "Endpoint tidak ditemukan. Pastikan backend sudah di-restart."
      );
    }

    throw new Error(`Request gagal (status ${response.status})`);
  }

  return payload?.data as T;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const authToken = token ?? getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  return parseResponse<T>(response, path);
}

export async function apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const authToken = token ?? getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  return parseResponse<T>(response, path);
}
