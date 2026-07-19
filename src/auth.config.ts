import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/masuk" },
  session: { strategy: "jwt" },
  providers: [], // filled in src/auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
        token.nama = (user as { nama?: string }).nama;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.name = (token.nama as string) ?? session.user.name;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminPath) return true;
      const role = auth?.user?.role;
      if (role === "ADMIN") return true;
      // Logged in but not admin → send home. Not logged in → let Auth.js redirect to signIn (/masuk).
      if (auth) return Response.redirect(new URL("/", request.nextUrl));
      return false;
    },
  },
} satisfies NextAuthConfig;
