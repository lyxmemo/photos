import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isProtected =
        request.nextUrl.pathname.startsWith("/upload") ||
        request.nextUrl.pathname.startsWith("/manage");

      if (isProtected && !auth) return false;
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [],
};
