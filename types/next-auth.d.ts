import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

type Role = 'admin' | 'user';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    idToken?: string;
    user?: DefaultSession['user'] & {
      role?: Role;
    };
  }

  interface User extends DefaultUser {
    role?: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    idToken?: string;
    role?: Role;
  }
}
