// src/lib/types/index.ts
import type { User, Role } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export type AppUser = SafeUser;

export type NavItem = {
  label:    string;
  href:     string;
  icon:     string;
  roles:    Role[];
  children?: NavItem[];
};

export type ApiResponse<T = unknown> =
  | { success: true;  data: T }
  | { success: false; error: string };

export type PaginatedResponse<T> = {
  items:      T[];
  total:      number;
  page:       number;
  perPage:    number;
  totalPages: number;
};

export type PaginationParams = {
  page?:    number;
  perPage?: number;
  search?:  string;
};

export type SchoolLevel = 'NURSERY' | 'PRIMARY' | 'SECONDARY';
export type TermName    = 'First Term' | 'Second Term' | 'Third Term';
