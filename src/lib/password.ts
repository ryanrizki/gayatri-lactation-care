import { hash, verify } from "@node-rs/argon2";

/** Hash password dengan argon2id (default @node-rs/argon2). */
export function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

/** Verifikasi password terhadap hash. false bila tak cocok. */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    return await verify(hashed, plain);
  } catch {
    return false;
  }
}
