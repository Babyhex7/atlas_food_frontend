export const authRoles = {
  admin: "admin",
  respondent: "respondent",
} as const;

export type AuthRole = (typeof authRoles)[keyof typeof authRoles];
