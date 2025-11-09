import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

type Role = 'admin' | 'user';

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const resolveRole = (email?: string | null): Role => {
  if (!email) {
    return 'user';
  }
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }

      if (user?.email) {
        token.role = resolveRole(user.email);
      } else if (!token.role && token.email) {
        token.role = resolveRole(token.email);
      } else if (!token.role) {
        token.role = 'user';
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.idToken = token.idToken as string | undefined;
      session.user = {
        ...session.user,
        role: (token.role as Role) || 'user',
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
