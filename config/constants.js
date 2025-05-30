export const API_BASE_URL = 'http://10.0.2.2:8080/';

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_CODE: '/auth/verify-reset-code',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND: '/auth/resend',
  },
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
};

export const SCREEN_NAMES = {
  INDEX: 'index',
  LOGIN: 'login',
  REGISTER: 'register',
  VERIFY: 'verify',
  HOME: 'home',
  NOT_FOUND: '+not-found',
};
