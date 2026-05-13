export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  profile: "/profile",
  adminSurveys: "/admin/surveys",
  newAdminSurvey: "/admin/surveys/new",
  adminSurveyDetail: (id: string) => `/admin/surveys/${id}`,
  publicSurvey: (accessToken: string) => `/surveys/${accessToken}`,
  joinSurvey: (accessToken: string) => `/surveys/${accessToken}/join`,
} as const;
