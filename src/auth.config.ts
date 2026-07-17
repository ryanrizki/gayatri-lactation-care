import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/masuk" },
  session: { strategy: "jwt" },
  providers: [], // filled in src/auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
        token.nama = (user as { nama?: string }).nama;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
        session.user.name = (token.nama as string) ?? session.user.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
