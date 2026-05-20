// src/lib/stores/user.svelte.ts
import type { SafeUser } from '$lib/types';

// Svelte 5 runes-based user store
// Usage: import { userStore } from '$lib/stores/user.svelte';
//        userStore.user       → current user
//        userStore.isLoggedIn → boolean
//        userStore.isAdmin    → boolean

function createUserStore() {
  let user = $state<SafeUser | null>(null);

  return {
    get user()        { return user; },
    get isLoggedIn()  { return user !== null; },
    get isAdmin()     { return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'; },
    get isSuperAdmin(){ return user?.role === 'SUPER_ADMIN'; },
    get isTeacher()   { return user?.role === 'TEACHER'; },
    get isStudent()   { return user?.role === 'STUDENT'; },

    set(u: SafeUser | null) { user = u; },
    clear()                 { user = null; },
  };
}

export const userStore = createUserStore();
