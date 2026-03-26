export const ROUTES = {
  // Auth
  SPLASH: 'Splash',
  AUTH: 'Auth',
  REGISTER: 'Register',
  // Main tabs
  HOME: 'Home',
  SCAN: 'Scan',
  SCAN_TAB: 'ScanTab',
  EDUCATION: 'Education',
  GAMIFICATION: 'Gamification',
  REPORTS: 'Reports',
  PROFILE: 'Profile',
  // Nested
  RESULT: 'Result',
  SUBMIT_REPORT: 'SubmitReport',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
