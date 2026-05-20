// src/app.d.ts
import type { SafeUser } from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      user: SafeUser | null;
      session: { id: string; userId: string; expiresAt: Date } | null;
    }
    interface PageData {
      user?: SafeUser | null;
    }
  }
}

export {};
