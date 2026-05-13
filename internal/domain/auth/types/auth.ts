import type { AuthRole } from "../constants/authRoles";

export type User = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type RefreshToken = {
  id: number;
  user_id: string;
  expires_at: string;
  created_at: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type UserInfo = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  is_active: boolean;
};

export type AuthResponse = {
  user: UserInfo;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type ProfileResponse = UserInfo & {
  created_at: string;
};
