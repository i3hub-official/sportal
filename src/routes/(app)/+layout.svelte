<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';
  import {
    LayoutDashboard, Users, BookOpen, School, BookMarked,
    Trophy, ClipboardCheck, Clock, Wallet, Settings, LogOut, GraduationCap, Menu
  } from 'lucide-svelte';

  let { data, children }: { data: LayoutData; children: any } = $props();

  let sidebarOpen = $state(false);

  type NavItem = { label: string; href: string; roles: string[]; icon: any };

  const nav: NavItem[] = [
    { label: 'Dashboard',  href: '/dashboard',  roles: ['SUPER_ADMIN','ADMIN','TEACHER','STUDENT','PARENT'], icon: LayoutDashboard },
    { label: 'Staff',      href: '/staff',       roles: ['SUPER_ADMIN','ADMIN'],                             icon: Users },
    { label: 'Students',   href: '/students',    roles: ['SUPER_ADMIN','ADMIN','TEACHER'],                   icon: BookOpen },
    { label: 'Classes',    href: '/classes',     roles: ['SUPER_ADMIN','ADMIN','TEACHER'],                   icon: School },
    { label: 'Subjects',   href: '/subjects',    roles: ['SUPER_ADMIN','ADMIN','TEACHER'],                   icon: BookMarked },
    { label: 'Results',    href: '/results',     roles: ['SUPER_ADMIN','ADMIN','TEACHER','STUDENT','PARENT'],icon: Trophy },
    { label: 'Attendance', href: '/attendance',  roles: ['SUPER_ADMIN','ADMIN','TEACHER'],                   icon: ClipboardCheck },
    { label: 'Timetable',  href: '/timetable',   roles: ['SUPER_ADMIN','ADMIN','TEACHER','STUDENT'],         icon: Clock },
    { label: 'Fees',       href: '/fees',        roles: ['SUPER_ADMIN','ADMIN'],                             icon: Wallet },
    { label: 'Settings',   href: '/settings',    roles: ['SUPER_ADMIN'],                                     icon: Settings },
  ];

  const role       = data.user?.role ?? '';
  const visibleNav = nav.filter(n => n.roles.includes(role));
  const currentPath = $derived($page.url.pathname);

  const displayName = $derived(
    data.user?.staffProfile
      ? `${data.user.staffProfile.firstName} ${data.user.staffProfile.lastName}`
      : data.user?.studentProfile
      ? `${data.user.studentProfile.firstName} ${data.user.studentProfile.lastName}`
      : data.user?.email ?? 'User'
  );

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Headmaster',
    ADMIN:       'Administrator',
    TEACHER:     'Teacher',
    STUDENT:     'Student',
    PARENT:      'Parent',
  };

  function isActive(href: string) {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(href);
  }
</script>

<div class="flex h-screen bg-slate-100 overflow-hidden">

  <!-- Mobile overlay -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      role="button" tabindex="0"
      onclick={() => sidebarOpen = false}
      onkeydown={e => e.key === 'Escape' && (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Sidebar -->
  <aside class="
    fixed lg:static inset-y-0 left-0 z-30
    w-60 bg-slate-900 flex flex-col
    transition-transform duration-200 ease-in-out
    {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  ">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-4 py-4 border-b border-slate-800 shrink-0">
      <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <GraduationCap class="w-5 h-5 text-white" />
      </div>
      <div class="min-w-0">
        <p class="text-white font-bold text-sm leading-tight truncate">SMS Portal</p>
        <p class="text-slate-400 text-xs truncate">School Management</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      {#each visibleNav as item}
        <a
          href={item.href}
          onclick={() => sidebarOpen = false}
          class="
            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-colors duration-100
            {isActive(item.href)
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'}
          "
        >
          <svelte:component this={item.icon} class="w-4 h-4 shrink-0" />
          {item.label}
        </a>
      {/each}
    </nav>

    <!-- User block -->
    <div class="p-2 border-t border-slate-800 shrink-0">
      <div class="flex items-center gap-2.5 px-2 py-2 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 uppercase">
          {displayName.charAt(0)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-white text-xs font-semibold truncate">{displayName}</p>
          <p class="text-slate-400 text-xs">{roleLabel[role] ?? role}</p>
        </div>
        <form method="POST" action="/logout">
          <button
            type="submit"
            title="Logout"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </aside>

  <!-- Content -->
  <div class="flex-1 flex flex-col overflow-hidden min-w-0">

    <!-- Mobile topbar -->
    <header class="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
      <button
        onclick={() => sidebarOpen = true}
        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <Menu class="w-5 h-5" />
      </button>
      <span class="font-bold text-slate-800 text-sm">SMS Portal</span>
    </header>

    <main class="flex-1 overflow-y-auto p-4 lg:p-6">
      {@render children()}
    </main>
  </div>
</div>