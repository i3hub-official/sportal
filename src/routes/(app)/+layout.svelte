<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import type { LayoutData } from './$types';
  import {
    LayoutDashboard, Users, BookOpen, School, BookMarked,
    Trophy, ClipboardCheck, Clock, Wallet, Settings, LogOut, GraduationCap, Menu, Loader2
  } from 'lucide-svelte';

  let { data, children }: { data: LayoutData; children: any } = $props();

  let sidebarOpen        = $state(false);
  let showLogoutModal    = $state(false);
  let signingOut         = $state(false);
  let navigationProgress = $state(0);
  let navigationInterval: ReturnType<typeof setInterval> | null = null;
  let showProgress       = $state(false);
  let logoutForm: HTMLFormElement;

  // ── Role & StaffRole ────────────────────────────────────────────────────────
  const role      = data.user?.role      ?? '';
  const staffRole = data.user?.staffProfile?.staffRole ?? '';

  // ── Nav definition ──────────────────────────────────────────────────────────
  type NavItem = {
    label:       string;
    href:        string;
    icon:        any;
    roles:       string[];
    staffRoles?: string[];
    exclude?:    string[];
  };

  const nav: NavItem[] = [
    {
      label: 'Dashboard',
      href:  '/dashboard',
      icon:  LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    },
    {
      label: 'Staff',
      href:  '/staff',
      icon:  Users,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      label: 'Students',
      href:  '/students',
      icon:  BookOpen,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
      exclude: ['SUPPORT_STAFF', 'LIBRARIAN'],
    },
    {
      label: 'Classes',
      href:  '/classes',
      icon:  School,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
      staffRoles: ['HEADMASTER', 'DEPUTY_HEAD', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'COUNSELOR'],
    },
    {
      label: 'Subjects',
      href:  '/subjects',
      icon:  BookMarked,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
      staffRoles: ['HEADMASTER', 'DEPUTY_HEAD', 'CLASS_TEACHER', 'SUBJECT_TEACHER'],
    },
    {
      label: 'Results',
      href:  '/results',
      icon:  Trophy,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      exclude: ['BURSAR', 'SECRETARY', 'SUPPORT_STAFF', 'LIBRARIAN'],
    },
    {
      label: 'Attendance',
      href:  '/attendance',
      icon:  ClipboardCheck,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
      exclude: ['BURSAR', 'SECRETARY', 'SUPPORT_STAFF', 'LIBRARIAN'],
    },
    {
      label: 'Timetable',
      href:  '/timetable',
      icon:  Clock,
      roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      label: 'Fees',
      href:  '/fees',
      icon:  Wallet,
      roles: ['SUPER_ADMIN', 'ADMIN'],
      staffRoles: ['HEADMASTER', 'DEPUTY_HEAD', 'BURSAR', 'SECRETARY'],
    },
    {
      label: 'Settings',
      href:  '/settings',
      icon:  Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  // ── Filter nav ──────────────────────────────────────────────────────────────
  const visibleNav = $derived(
    nav.filter(item => {
      if (!item.roles.includes(role)) return false;
      if (role !== 'TEACHER') return true;
      if (item.exclude?.includes(staffRole)) return false;
      if (item.staffRoles?.length) return item.staffRoles.includes(staffRole);
      return true;
    })
  );

  // ── Navigation progress ─────────────────────────────────────────────────────
  const currentPath  = $derived($page.url.pathname);
  const isNavigating = $derived($navigating);

  $effect(() => {
    if (isNavigating) {
      showProgress       = true;
      navigationProgress = 0;
      if (navigationInterval) clearInterval(navigationInterval);
      navigationInterval = setInterval(() => {
        if (navigationProgress < 90) {
          const inc = Math.max(1, (90 - navigationProgress) / 20);
          navigationProgress = Math.min(90, navigationProgress + inc);
        }
      }, 50);
    } else {
      if (navigationProgress > 0) {
        navigationProgress = 100;
        setTimeout(() => { showProgress = false; navigationProgress = 0; }, 300);
      }
      if (navigationInterval) { clearInterval(navigationInterval); navigationInterval = null; }
    }
  });

  // ── Display helpers ─────────────────────────────────────────────────────────
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

  const staffRoleLabel: Record<string, string> = {
    HEADMASTER:      'Headmaster',
    DEPUTY_HEAD:     'Deputy Head',
    CLASS_TEACHER:   'Class Teacher',
    SUBJECT_TEACHER: 'Subject Teacher',
    BURSAR:          'Bursar',
    SECRETARY:       'Secretary',
    LIBRARIAN:       'Librarian',
    COUNSELOR:       'Counselor',
    SUPPORT_STAFF:   'Support Staff',
  };

  const userSubtitle = $derived(
    staffRole && role === 'TEACHER'
      ? (staffRoleLabel[staffRole] ?? roleLabel[role])
      : roleLabel[role] ?? role
  );

  function isActive(href: string) {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(href);
  }

  function confirmLogout() {
    showLogoutModal = true;
    sidebarOpen     = false;
  }

  function cancelLogout() {
    showLogoutModal = false;
  }

  function submitLogout() {
    signingOut = true;
    logoutForm.submit();
  }
</script>

<div class="layout">

  <!-- Progress bar -->
  {#if showProgress}
    <div class="progress-wrap">
      <div class="progress-bar" style="width: {navigationProgress}%;"></div>
      <div class="progress-glow" style="width: {navigationProgress}%;"></div>
    </div>
  {/if}

  <!-- Mobile overlay -->
  {#if sidebarOpen}
    <div class="mobile-overlay" role="button" tabindex="0"
      onclick={() => sidebarOpen = false}
      onkeydown={e => e.key === 'Escape' && (sidebarOpen = false)}>
    </div>
  {/if}

  <!-- ── Logout confirmation modal ── -->
  {#if showLogoutModal}
    <!-- Backdrop -->
    <div class="modal-backdrop" role="button" tabindex="0"
      onclick={cancelLogout}
      onkeydown={e => e.key === 'Escape' && cancelLogout()}>
    </div>

    <!-- Modal -->
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
      <!-- Icon -->
      <div class="modal-icon">
        <LogOut class="modal-icon-svg" />
      </div>

      <h2 id="logout-title" class="modal-title">Sign out?</h2>
      <p class="modal-desc">
        You're signed in as <strong>{displayName}</strong>.<br/>
        Are you sure you want to sign out?
      </p>

      <div class="modal-actions">
        <button type="button" onclick={cancelLogout} class="modal-btn-cancel">
          Stay signed in
        </button>
        <button type="button" onclick={submitLogout} disabled={signingOut} class="modal-btn-confirm">
          {#if signingOut}
            <Loader2 class="btn-icon spinning" />
            Signing out...
          {:else}
            <LogOut class="btn-icon" />
            Yes, sign out
          {/if}
        </button>
      </div>
    </div>

    <!-- Hidden form for actual POST -->
    <form bind:this={logoutForm} method="POST" action="/logout" style="display:none;">
    </form>
  {/if}

  <!-- Sidebar -->
  <aside class="sidebar {sidebarOpen ? 'open' : ''}">
    <!-- Brand -->
    <div class="brand">
      <div class="brand-icon">
        <GraduationCap class="icon-sm" />
      </div>
      <div class="brand-text">
        <p class="brand-name">SMS Portal</p>
        <p class="brand-sub">School Management</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="nav-list">
      {#each visibleNav as item}
        <a href={item.href} onclick={() => sidebarOpen = false}
          class="nav-item {isActive(item.href) ? 'active' : ''}">
          {#if isActive(item.href)}<span class="active-bar"></span>{/if}
          <svelte:component this={item.icon} class="icon-sm" />
          {item.label}
        </a>
      {/each}
    </nav>

    <!-- User -->
    <div class="user-block">
      <div class="user-inner">
        <div class="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <p class="user-name">{displayName}</p>
          <p class="user-role">{userSubtitle}</p>
        </div>
        <button type="button" title="Sign out" onclick={confirmLogout} class="logout-btn">
          <LogOut class="icon-sm" />
        </button>
      </div>
    </div>
  </aside>

  <!-- Main -->
  <div class="main">
    <!-- Mobile topbar -->
    <header class="topbar">
      <button onclick={() => sidebarOpen = true} class="menu-btn">
        <Menu class="icon-sm" />
      </button>
      <span class="topbar-title">SMS Portal</span>
      {#if isNavigating}
        <div class="nav-pulse"></div>
      {/if}
    </header>

    <main class="content">
      <div class="fade-in">
        {@render children()}
      </div>
    </main>
  </div>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: #f1f5f9;
  }

  /* ── Progress ── */
  .progress-wrap {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 50;
  }
  .progress-bar {
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
    transition: width 100ms ease-out;
  }
  .progress-glow {
    position: absolute;
    top: 0;
    height: 2px;
    background: #93c5fd;
    filter: blur(2px);
    opacity: 0.6;
    transition: width 100ms ease-out;
  }

  /* ── Mobile overlay ── */
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 20;
  }

  /* ── Logout modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    z-index: 40;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 41;
    background: white;
    border-radius: 1.25rem;
    padding: 2rem 1.75rem 1.75rem;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    text-align: center;
    animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  .modal-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: #fef2f2;
    border: 1px solid #fecaca;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem;
    color: #ef4444;
  }
  .modal-icon-svg {
    width: 24px; height: 24px;
  }

  .modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.5rem;
  }

  .modal-desc {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  .modal-desc strong { color: #0f172a; font-weight: 600; }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .modal-btn-cancel {
    padding: 0.625rem 1.25rem;
    border-radius: 0.625rem;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 150ms, border-color 150ms;
  }
  .modal-btn-cancel:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .modal-btn-confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.625rem;
    border: none;
    background: #ef4444;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms, transform 100ms, opacity 150ms;
  }
  .modal-btn-confirm:hover:not(:disabled) { background: #dc2626; }
  .modal-btn-confirm:active:not(:disabled) { transform: scale(0.98); }
  .modal-btn-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  :global(.spinning) {
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .btn-icon { width: 14px; height: 14px; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 30;
    width: 240px;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 200ms ease-in-out;
  }
  .sidebar.open { transform: translateX(0); }

  @media (min-width: 1024px) {
    .sidebar { position: static; transform: none; flex-shrink: 0; }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid #1e293b;
    flex-shrink: 0;
  }
  .brand-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: #2563eb;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: white;
  }
  .brand-name { color: white; font-weight: 700; font-size: 0.875rem; line-height: 1.2; }
  .brand-sub  { color: #94a3b8; font-size: 0.75rem; }

  .nav-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .nav-list::-webkit-scrollbar { width: 4px; }
  .nav-list::-webkit-scrollbar-track { background: #1e293b; }
  .nav-list::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
  .nav-list::-webkit-scrollbar-thumb:hover { background: #64748b; }

  .nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #94a3b8;
    text-decoration: none;
    transition: background 100ms, color 100ms;
    overflow: hidden;
  }
  .nav-item:hover  { background: #1e293b; color: white; }
  .nav-item.active { background: #2563eb; color: white; }

  .active-bar {
    position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 20px;
    background: white;
    border-radius: 0 2px 2px 0;
  }

  .user-block { padding: 0.5rem; border-top: 1px solid #1e293b; flex-shrink: 0; }
  .user-inner {
    display: flex; align-items: center;
    gap: 0.625rem; padding: 0.5rem; border-radius: 0.5rem;
  }
  .user-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #2563eb;
    color: white;
    font-size: 0.75rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name {
    color: white; font-size: 0.75rem; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .user-role { color: #94a3b8; font-size: 0.7rem; }

  .logout-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.5rem;
    border: none; background: transparent;
    color: #64748b; cursor: pointer;
    transition: color 150ms, background 150ms;
    flex-shrink: 0;
  }
  .logout-btn:hover { color: #f87171; background: #1e293b; }

  /* ── Main ── */
  .main {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; min-width: 0;
  }

  .topbar {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white; border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }
  @media (min-width: 1024px) { .topbar { display: none; } }

  .menu-btn {
    padding: 0.375rem; border-radius: 0.5rem;
    border: none; background: transparent;
    color: #64748b; cursor: pointer;
  }
  .menu-btn:hover { background: #f1f5f9; }

  .topbar-title { font-weight: 700; font-size: 0.875rem; color: #0f172a; }

  .nav-pulse {
    margin-left: auto;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #3b82f6;
    animation: pulse 1s ease-in-out infinite;
  }

  .content { flex: 1; overflow-y: auto; padding: 1.5rem; }

  /* ── Animations ── */
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-in { animation: fadeInUp 0.25s ease-out; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  :global(.icon-sm) { width: 16px; height: 16px; }
</style>