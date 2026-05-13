export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  admin: {
    surveys: "/admin/surveys",
    surveyDetail: (id: string) => `/admin/surveys/${id}`,
    cloneSurvey: (id: string) => `/admin/surveys/${id}/clone`,
  },
  publicSurvey: {
    detail: (accessToken: string) => `/surveys/${accessToken}`,
    join: (accessToken: string) => `/surveys/${accessToken}/join`,
  },
} as const;
