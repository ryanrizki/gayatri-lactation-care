import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { role: "USER" | "ADMIN" } & DefaultSession["user"];
  }
  interface User {
    role: "USER" | "ADMIN";
    nama: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    nama?: string;
  }
}
