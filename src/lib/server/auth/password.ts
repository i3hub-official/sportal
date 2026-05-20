// src/lib/server/auth/password.ts
import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return verify(hashed, password);
}
