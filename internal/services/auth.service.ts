import { apiClient } from "@/internal/lib/axios";
import { clearAuthCookies, setAuthCookies } from "@/internal/lib/cookies";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: "admin" | "respondent";
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/login", payload);
  setAuthCookies(data.data.access_token, data.data.refresh_token, data.data.expires_in);
  return data.data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/register", payload);
  setAuthCookies(data.data.access_token, data.data.refresh_token, data.data.expires_in);
  return data.data;
}

export async function getProfile() {
  const { data } = await apiClient.get("/auth/me");
  return data.data;
}

export function logout() {
  clearAuthCookies();
  window.location.href = "/login";
}
