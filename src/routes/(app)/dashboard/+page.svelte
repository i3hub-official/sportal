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
    { label: 'Total Staff',    value: stats.totalStaff,     icon: Users,          bg: 'bg-blue-50',    iconBg: 'bg-blue-100',   text: 'text-blue-700'   },
    { label: 'Total Students', value: stats.totalStudents,  icon: BookOpen,       bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-700'},
    { label: 'Nursery',        value: stats.nurseryCount,   icon: Baby,           bg: 'bg-violet-50',  iconBg: 'bg-violet-100',  text: 'text-violet-700' },
    { label: 'Primary',        value: stats.primaryCount,   icon: School,         bg: 'bg-amber-50',   iconBg: 'bg-amber-100',   text: 'text-amber-700'  },
    { label: 'Secondary',      value: stats.secondaryCount, icon: GraduationCap,  bg: 'bg-rose-50',    iconBg: 'bg-rose-100',    text: 'text-rose-700'   },
  ];

  const quickActions = [
    { label: 'Add Student',     href: '/students/new', icon: UserPlus,       accent: 'hover:border-blue-300 hover:bg-blue-50',    iconColor: 'text-blue-600'    },
    { label: 'Add Staff',       href: '/staff/new',    icon: UserRoundPlus,  accent: 'hover:border-emerald-300 hover:bg-emerald-50', iconColor: 'text-emerald-600'},
    { label: 'Enter Results',   href: '/results',      icon: ClipboardList,  accent: 'hover:border-amber-300 hover:bg-amber-50',  iconColor: 'text-amber-600'   },
    { label: 'Attendance',      href: '/attendance',   icon: ClipboardCheck, accent: 'hover:border-violet-300 hover:bg-violet-50', iconColor: 'text-violet-600' },
    { label: 'Timetable',       href: '/timetable',    icon: Clock,          accent: 'hover:border-rose-300 hover:bg-rose-50',    iconColor: 'text-rose-600'    },
    { label: 'Fee Records',     href: '/fees',         icon: Wallet,         accent: 'hover:border-slate-300 hover:bg-slate-50',  iconColor: 'text-slate-600'   },
  ];

  const levelBadge: Record<string, string> = {
    NURSERY:   'bg-violet-100 text-violet-700',
    PRIMARY:   'bg-blue-100 text-blue-700',
    SECONDARY: 'bg-emerald-100 text-emerald-700',
  };

  function levelLabel(level: string) {
    return level.charAt(0) + level.slice(1).toLowerCase();
  }
</script>

<svelte:head><title>Dashboard — SMS</title></svelte:head>

<div class="space-y-6 max-w-6xl mx-auto">

  <!-- Header -->
  <div class="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
      <p class="text-sm text-slate-500 mt-0.5">
        {#if currentTerm}
          {currentTerm.name} &middot; {currentTerm.academicYear.name}
        {:else}
          No active term configured
        {/if}
      </p>
    </div>
    {#if !currentTerm}
      <a href="/settings"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
        <AlertCircle class="w-4 h-4" />
        Set active term
      </a>
    {/if}
  </div>

  <!-- Stat cards -->
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    {#each statCards as card}
      <div class="rounded-xl {card.bg} p-4 flex items-center gap-3">
        <div class="{card.iconBg} {card.text} w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <svelte:component this={card.icon} class="w-5 h-5" />
        </div>
        <div>
          <p class="text-xl font-bold text-slate-900 leading-none">{card.value}</p>
          <p class="text-xs text-slate-500 mt-1">{card.label}</p>
        </div>
      </div>
    {/each}
  </div>

  <!-- Lower grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <!-- Quick actions -->
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Quick actions</h2>
      </div>
      <div class="p-4 grid grid-cols-3 gap-2.5">
        {#each quickActions as action}
          <a href={action.href}
            class="group flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200
                   transition-all duration-150 {action.accent}">
            <div class="{action.iconColor} transition-colors">
              <svelte:component this={action.icon} class="w-5 h-5" />
            </div>
            <span class="text-xs font-medium text-slate-600 text-center leading-tight">{action.label}</span>
          </a>
        {/each}
      </div>
    </div>

    <!-- Recent enrolments -->
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-800">Recent enrolments</h2>
        <a href="/students" class="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 hover:text-blue-700">
          View all <ChevronRight class="w-3.5 h-3.5" />
        </a>
      </div>

      {#if recentStudents.length === 0}
        <div class="flex flex-col items-center justify-center py-14 text-center px-6">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <BookOpen class="w-5 h-5 text-slate-400" />
          </div>
          <p class="text-sm text-slate-500">No students enrolled yet.</p>
          <a href="/students/new" class="mt-2 text-sm font-medium text-blue-600 hover:underline">
            Enrol the first one →
          </a>
        </div>
      {:else}
        <ul class="divide-y divide-slate-100">
          {#each recentStudents as student}
            <li>
              <a href="/students/{student.id}"
                class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center
                            justify-center text-xs font-bold shrink-0 uppercase">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p class="text-xs text-slate-400 truncate">
                    {student.class?.name ?? 'No class'} &middot; {student.admissionNo}
                  </p>
                </div>
                <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full
                             {levelBadge[student.level] ?? 'bg-slate-100 text-slate-600'}">
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