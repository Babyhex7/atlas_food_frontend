import type { ApiResponse } from "../utils/response";
import { getAccessToken } from "@/internal/lib/cookies";
import { API_BASE_URL, redirectToLogin, refreshOnce } from "@/internal/lib/authRefresh";

export { API_BASE_URL };

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

/**
 * Jalankan request, dan kalau balasannya 401 coba sekali refresh token lalu ulangi.
 *
 * Klien ini dulu sama sekali tidak menangani 401, berbeda dengan klien axios di
 * internal/lib/axios.ts. Akibatnya endpoint yang lewat sini gagal keras begitu
 * access token kedaluwarsa, padahal refresh token-nya masih berlaku. Keduanya
 * kini berbagi antrean refresh yang sama lewat refreshOnce().
 *
 * `explicitToken` yang dikirim pemanggil tidak pernah di-refresh: itu token
 * milik pemanggil (mis. dari server component), bukan sesi browser.
 */
async function requestWithRefresh(
  url: string,
  init: RequestInit,
  explicitToken: string | undefined,
  path: string
): Promise<Response> {
  const authToken = explicitToken ?? getAccessToken();

  const withAuth = (token: string | null | undefined): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const response = await fetch(url, withAuth(authToken));

  const canRefresh =
    response.status === 401 && !explicitToken && typeof window !== "undefined" && !path.includes("/auth/refresh");
  if (!canRefresh) return response;

  try {
    const freshToken = await refreshOnce();
    return await fetch(url, withAuth(freshToken));
  } catch {
    redirectToLogin();
    return response;
  }
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await requestWithRefresh(
    `${API_BASE_URL}${path}`,
    {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    },
    token,
    path
  );

  return parseResponse<T>(response, path);
}

export async function apiUpload<T>(path: string, formData: FormData, token?: string): Promise<T> {
  // Sengaja tanpa Content-Type: browser harus menyusunnya sendiri lengkap
  // dengan boundary multipart.
  const response = await requestWithRefresh(
    `${API_BASE_URL}${path}`,
    { method: "POST", body: formData },
    token,
    path
  );

  return parseResponse<T>(response, path);
}
