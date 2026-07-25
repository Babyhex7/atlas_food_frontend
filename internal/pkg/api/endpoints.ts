export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    me: "/auth/me",
    updateProfile: "/auth/me",
    changePassword: "/auth/me/password",
    uploadPhoto: "/auth/me/photo",
  },
  admin: {
    surveys: "/admin/surveys",
    surveyDetail: (id: string) => `/admin/surveys/${id}`,
    cloneSurvey: (id: string) => `/admin/surveys/${id}/clone`,
  },
  publicSurvey: {
    /** Hub daftar survey aktif (login wajib) */
    hub: "/surveys",
    recall: (accessToken: string) => `/surveys/${accessToken}/recall`,
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
