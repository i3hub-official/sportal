<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import {
    Users, BookOpen, Baby, School, GraduationCap,
    UserPlus, UserRoundPlus, ClipboardList, ClipboardCheck,
    Clock, Wallet, ChevronRight, AlertCircle
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();
  const { stats, currentTerm, recentStudents } = data;

  const statCards = [
    { label: 'Total Staff',    value: stats.totalStaff,     icon: Users,          color: 'blue'   },
    { label: 'Total Students', value: stats.totalStudents,  icon: BookOpen,       color: 'emerald' },
    { label: 'Nursery',        value: stats.nurseryCount,   icon: Baby,           color: 'violet' },
    { label: 'Primary',        value: stats.primaryCount,   icon: School,         color: 'amber'  },
    { label: 'Secondary',      value: stats.secondaryCount, icon: GraduationCap,  color: 'rose'   },
  ];

  const quickActions = [
    { label: 'Add Student',     href: '/students/new', icon: UserPlus,       color: 'blue'    },
    { label: 'Add Staff',       href: '/staff/new',    icon: UserRoundPlus,  color: 'emerald' },
    { label: 'Enter Results',   href: '/results',      icon: ClipboardList,  color: 'amber'   },
    { label: 'Attendance',      href: '/attendance',   icon: ClipboardCheck, color: 'violet'  },
    { label: 'Timetable',       href: '/timetable',    icon: Clock,          color: 'rose'    },
    { label: 'Fee Records',     href: '/fees',         icon: Wallet,         color: 'slate'   },
  ];

  const levelBadge: Record<string, string> = {
    NURSERY:   'badge-violet',
    PRIMARY:   'badge-blue',
    SECONDARY: 'badge-emerald',
  };

  function levelLabel(level: string) {
    return level.charAt(0) + level.slice(1).toLowerCase();
  }
</script>

<svelte:head><title>Dashboard — LSAI</title></svelte:head>

<div class="dashboard-container">

  <!-- Header -->
  <div class="dashboard-header">
    <div>
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">
        {#if currentTerm}
          {currentTerm.name} · {currentTerm.academicYear.name}
        {:else}
          No active term configured
        {/if}
      </p>
    </div>
    {#if !currentTerm}
      <a href="/settings" class="alert-link">
        <AlertCircle class="icon-sm" />
        Set active term
      </a>
    {/if}
  </div>

  <!-- Stat cards -->
  <div class="stats-grid">
    {#each statCards as card}
      <div class="stat-card {card.color}">
        <div class="stat-icon">
          <svelte:component this={card.icon} class="icon-md" />
        </div>
        <div>
          <p class="stat-value">{card.value}</p>
          <p class="stat-label">{card.label}</p>
        </div>
      </div>
    {/each}
  </div>

  <!-- Lower grid -->
  <div class="dashboard-grid">

    <!-- Quick actions -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Quick actions</h2>
      </div>
      <div class="quick-actions-grid">
        {#each quickActions as action}
          <a href={action.href} class="quick-action-btn {action.color}">
            <div class="action-icon">
              <svelte:component this={action.icon} class="icon-sm" />
            </div>
            <span class="action-label">{action.label}</span>
          </a>
        {/each}
      </div>
    </div>

    <!-- Recent enrolments -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Recent enrolments</h2>
        <a href="/students" class="view-all-link">
          View all
          <ChevronRight class="icon-xs" />
        </a>
      </div>

      {#if recentStudents.length === 0}
        <div class="empty-state">
          <div class="empty-icon">
            <BookOpen class="icon-lg" />
          </div>
          <p class="empty-text">No students enrolled yet.</p>
          <a href="/students/new" class="empty-link">
            Enrol the first one →
          </a>
        </div>
      {:else}
        <ul class="students-list">
          {#each recentStudents as student}
            <li>
              <a href="/students/{student.id}" class="student-item">
                <div class="student-avatar">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div class="student-info">
                  <p class="student-name">
                    {student.firstName} {student.lastName}
                  </p>
                  <p class="student-meta">
                    {student.class?.name ?? 'No class'} · {student.admissionNo}
                  </p>
                </div>
                <span class="level-badge {levelBadge[student.level] ?? 'badge-gray'}">
                  {levelLabel(student.level)}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

  </div>
</div>

<style>
  /* ── Container ── */
  .dashboard-container {
    max-width: 72rem;
    margin: 0 auto;
  }

  /* ── Header ── */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #0f172a;
  }

  .dashboard-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.125rem;
  }

  .alert-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fde68a;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .alert-link:hover {
    background: #fef3c7;
  }

  /* ── Stats Grid ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .stat-card {
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: transform 0.15s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-card.blue {
    background: #eff6ff;
  }
  .stat-card.blue .stat-icon {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .stat-card.emerald {
    background: #ecfdf5;
  }
  .stat-card.emerald .stat-icon {
    background: #d1fae5;
    color: #065f46;
  }

  .stat-card.violet {
    background: #f5f3ff;
  }
  .stat-card.violet .stat-icon {
    background: #ede9fe;
    color: #5b21b6;
  }

  .stat-card.amber {
    background: #fffbeb;
  }
  .stat-card.amber .stat-icon {
    background: #fef3c7;
    color: #92400e;
  }

  .stat-card.rose {
    background: #fff1f2;
  }
  .stat-card.rose .stat-icon {
    background: #ffe4e6;
    color: #9f1239;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.2;
    color: #0f172a;
  }

  .stat-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: #64748b;
    margin-top: 0.125rem;
  }

  /* ── Dashboard Grid ── */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ── Card ── */
  .card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
  }

  .card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .view-all-link {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #2563eb;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .view-all-link:hover {
    color: #1d4ed8;
  }

  /* ── Quick Actions ── */
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
    padding: 1rem;
  }

  .quick-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 0.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .quick-action-btn.blue:hover {
    border-color: #93c5fd;
    background: #eff6ff;
  }
  .quick-action-btn.blue .action-icon {
    color: #2563eb;
  }

  .quick-action-btn.emerald:hover {
    border-color: #6ee7b7;
    background: #ecfdf5;
  }
  .quick-action-btn.emerald .action-icon {
    color: #10b981;
  }

  .quick-action-btn.amber:hover {
    border-color: #fcd34d;
    background: #fffbeb;
  }
  .quick-action-btn.amber .action-icon {
    color: #f59e0b;
  }

  .quick-action-btn.violet:hover {
    border-color: #c4b5fd;
    background: #f5f3ff;
  }
  .quick-action-btn.violet .action-icon {
    color: #8b5cf6;
  }

  .quick-action-btn.rose:hover {
    border-color: #fecdd3;
    background: #fff1f2;
  }
  .quick-action-btn.rose .action-icon {
    color: #f43f5e;
  }

  .quick-action-btn.slate:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
  .quick-action-btn.slate .action-icon {
    color: #475569;
  }

  .action-icon {
    transition: color 0.15s ease;
  }

  .action-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: #475569;
    text-align: center;
    line-height: 1.3;
  }

  .quick-action-btn:hover .action-label {
    color: #1e293b;
  }

  /* ── Students List ── */
  .students-list {
    list-style: none;
  }

  .students-list li {
    border-bottom: 1px solid #f1f5f9;
  }

  .students-list li:last-child {
    border-bottom: none;
  }

  .student-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .student-item:hover {
    background: #f8fafc;
  }

  .student-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #d1fae5;
    color: #065f46;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .student-info {
    flex: 1;
    min-width: 0;
  }

  .student-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .student-meta {
    font-size: 0.7rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.125rem;
  }

  .level-badge {
    display: inline-flex;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.65rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .badge-violet {
    background: #f5f3ff;
    color: #5b21b6;
  }

  .badge-blue {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .badge-emerald {
    background: #ecfdf5;
    color: #065f46;
  }

  .badge-gray {
    background: #f1f5f9;
    color: #475569;
  }

  /* ── Empty State ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    color: #94a3b8;
  }

  .empty-text {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .empty-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #2563eb;
    text-decoration: none;
  }

  .empty-link:hover {
    text-decoration: underline;
  }

  /* ── Icon Sizes ── */
  .icon-xs {
    width: 0.875rem;
    height: 0.875rem;
  }

  .icon-sm {
    width: 1rem;
    height: 1rem;
  }

  .icon-md {
    width: 1.25rem;
    height: 1.25rem;
  }

  .icon-lg {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* ── Dark Mode ── */
  :global(.dark) .dashboard-title {
    color: #f8fafc;
  }

  :global(.dark) .dashboard-subtitle {
    color: #94a3b8;
  }

  :global(.dark) .alert-link {
    background: #78350f;
    border-color: #92400e;
    color: #fde68a;
  }

  :global(.dark) .alert-link:hover {
    background: #92400e;
  }

  :global(.dark) .stat-card.blue {
    background: #1e2d4a;
  }
  :global(.dark) .stat-card.blue .stat-icon {
    background: #2d4a7a;
    color: #93c5fd;
  }

  :global(.dark) .stat-card.emerald {
    background: #064e3b;
  }
  :global(.dark) .stat-card.emerald .stat-icon {
    background: #0d5b46;
    color: #6ee7b7;
  }

  :global(.dark) .stat-card.violet {
    background: #4c1d95;
  }
  :global(.dark) .stat-card.violet .stat-icon {
    background: #6b21a8;
    color: #c4b5fd;
  }

  :global(.dark) .stat-card.amber {
    background: #78350f;
  }
  :global(.dark) .stat-card.amber .stat-icon {
    background: #92400e;
    color: #fde68a;
  }

  :global(.dark) .stat-card.rose {
    background: #881337;
  }
  :global(.dark) .stat-card.rose .stat-icon {
    background: #9f1239;
    color: #fecdd3;
  }

  :global(.dark) .stat-value {
    color: #f8fafc;
  }

  :global(.dark) .stat-label {
    color: #94a3b8;
  }

  :global(.dark) .card {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .card-header {
    border-bottom-color: #334155;
  }

  :global(.dark) .card-title {
    color: #f8fafc;
  }

  :global(.dark) .view-all-link {
    color: #60a5fa;
  }

  :global(.dark) .view-all-link:hover {
    color: #93c5fd;
  }

  :global(.dark) .quick-action-btn {
    border-color: #475569;
  }

  :global(.dark) .quick-action-btn.blue:hover {
    background: #1e2d4a;
    border-color: #2d4a7a;
  }

  :global(.dark) .quick-action-btn.emerald:hover {
    background: #064e3b;
    border-color: #0d5b46;
  }

  :global(.dark) .quick-action-btn.amber:hover {
    background: #78350f;
    border-color: #92400e;
  }

  :global(.dark) .quick-action-btn.violet:hover {
    background: #4c1d95;
    border-color: #6b21a8;
  }

  :global(.dark) .quick-action-btn.rose:hover {
    background: #881337;
    border-color: #9f1239;
  }

  :global(.dark) .quick-action-btn.slate:hover {
    background: #334155;
    border-color: #475569;
  }

  :global(.dark) .action-label {
    color: #cbd5e1;
  }

  :global(.dark) .quick-action-btn:hover .action-label {
    color: #f8fafc;
  }

  :global(.dark) .students-list li {
    border-bottom-color: #334155;
  }

  :global(.dark) .student-item:hover {
    background: #0f172a;
  }

  :global(.dark) .student-avatar {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .student-name {
    color: #f8fafc;
  }

  :global(.dark) .student-meta {
    color: #94a3b8;
  }

  :global(.dark) .badge-violet {
    background: #4c1d95;
    color: #c4b5fd;
  }

  :global(.dark) .badge-blue {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .badge-emerald {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .badge-gray {
    background: #334155;
    color: #cbd5e1;
  }

  :global(.dark) .empty-icon {
    background: #334155;
    color: #64748b;
  }

  :global(.dark) .empty-text {
    color: #94a3b8;
  }

  :global(.dark) .empty-link {
    color: #60a5fa;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .quick-actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>