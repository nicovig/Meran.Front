export const endpoints = {
  applications: {
    list: '/api/Applications',
    byId: (id: string) => `/api/Applications/${id}`,
    addUser: (applicationId: string) => `/api/Applications/${applicationId}/users`,
  },
  auth: {
    login: '/api/Auth/login',
  },
  notification: {
    paymentIssues: '/api/Notification/payment-issues',
    paymentIssuesRun: '/api/Notification/payment-issues/run',
  },
  payments: {
    overview: '/api/payments/overview',
    create: (applicationId: string, userId: string) =>
      `/api/applications/${applicationId}/users/${userId}/payments`,
  },
} as const;
