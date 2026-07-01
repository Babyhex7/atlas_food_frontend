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
  // Public endpoints (tanpa auth, untuk respondent)
  public: {
    // Food Search (FREE SEARCH — parameter: q, type, limit)
    foodSearch: "/public/foods/search",
    foodDetail: (id: string) => `/public/foods/${id}`,
    categories: "/public/categories",
    // Survey submit memakai JWT respondent via POST /survey/submit
    surveySubmit: "/survey/submit",
  },
} as const;
