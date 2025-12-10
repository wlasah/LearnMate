declare module '../config/firebase' {
  import type { Auth } from 'firebase/auth';
  export const auth: Auth;
  export const analytics: any;
}
