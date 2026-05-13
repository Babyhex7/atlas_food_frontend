import { apiClient, apiEndpoints } from "@/internal/pkg/api";
import type { AuthResponse, LoginRequest, ProfileResponse, RefreshTokenRequest, RegisterRequest } from "../types/auth";

export function login(payload: LoginRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshToken(payload: RefreshTokenRequest) {
  return apiClient<AuthResponse>(apiEndpoints.auth.refresh, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProfile(token: string) {
  return apiClient<ProfileResponse>(apiEndpoints.auth.me, { token });
}
