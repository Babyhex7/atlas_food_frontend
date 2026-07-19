import { apiClient, apiEndpoints, apiUpload } from "@/internal/pkg/api";
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  ProfileResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "../types/auth";

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

export function updateProfile(payload: UpdateProfileRequest, token: string) {
  return apiClient<ProfileResponse>(apiEndpoints.auth.updateProfile, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
}

export function changePassword(payload: ChangePasswordRequest, token: string) {
  return apiClient<{ message: string }>(apiEndpoints.auth.changePassword, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  });
}

export function uploadProfilePhoto(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<ProfileResponse>(apiEndpoints.auth.uploadPhoto, formData, token);
}
