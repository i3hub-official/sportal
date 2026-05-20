<!-- src/routes/(app)/attendance/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  let selectedClass = $state('');
  let selectedDate  = $state(new Date().toISOString().slice(0, 10));
  let students      = $state<any[]>([]);
  let loading       = $state(false);
  let saving        = $state(false);
  let saved         = $state(false);

  async function loadAttendance() {
    if (!selectedClass || !selectedDate) return;
    loading = true;
    const res = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
    const json = await res.json();
    students = json.data ?? [];
    loading = false;
  }

  function setAll(status: string) {
    students = students.map(s => ({ ...s, status }));
  }

  async function saveAttendance() {
    saving = true;
    await fetch('/api/attendance', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ classId: selectedClass, date: selectedDate, records: students }),
    });
    saving = false;
    saved  = true;
    setTimeout(() => saved = false, 3000);
  }

  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  const statusColor: Record<string, string> = {
    PRESENT: 'badge-green', ABSENT: 'badge-red', LATE: 'badge-yellow', EXCUSED: 'badge-gray'
  };
</script>

<svelte:head><title>Attendance — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div><h1 class="page-title">Attendance</h1><p class="page-subtitle">Mark daily student attendance</p></div>
  </div>

  <div class="card mb-5">
    <div class="card-body flex flex-wrap gap-3 items-end">
      <div>
        <label class="label">Class *</label>
        <select bind:value={selectedClass} onchange={loadAttendance} class="input w-40">
          <option value="">Select class…</option>
          {#each data.classes as cls}
            <option value={cls.id}>{cls.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="label">Date *</label>
        <input type="date" bind:value={selectedDate} onchange={loadAttendance} class="input w-40"
          max={new Date().toISOString().slice(0, 10)} />
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-12"><div class="spinner w-8 h-8 border-blue-600"></div></div>
  {:else if students.length > 0}
    <div class="card">
      <div class="card-header">
        <p class="font-semibold text-slate-800">{students.length} students</p>
        <div class="flex gap-2">
          {#each statusOptions as s}
            <button onclick={() => setAll(s)} class="btn-secondary btn-sm">{s.charAt(0) + s.slice(1).toLowerCase()} All</button>
          {/each}
        </div>
      </div>
      <div class="card-body p-0">
        <table class="table">
          <thead><tr><th>#</th><th>Student</th><th>Status</th></tr></thead>
          <tbody>
            {#each students as student, i}
              <tr>
                <td class="text-slate-400">{i + 1}</td>
                <td class="font-medium">{student.studentName}</td>
                <td>
                  <div class="flex gap-1.5">
                    {#each statusOptions as s}
                      <button
                        onclick={() => student.status = s}
                        class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors
                          {student.status === s
                            ? s === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500'
                            : s === 'ABSENT'  ? 'bg-red-500 text-white border-red-500'
                            : s === 'LATE'    ? 'bg-amber-400 text-white border-amber-400'
                            : 'bg-slate-400 text-white border-slate-400'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}"
                      >
                        {s.charAt(0)}
                      </button>
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-slate-100 flex items-center gap-3">
        <button onclick={saveAttendance} disabled={saving} class="btn-primary">
          {#if saving}<span class="spinner"></span> Saving...{:else}💾 Save Attendance{/if}
        </button>
        {#if saved}<span class="text-emerald-600 text-sm font-medium">✅ Saved!</span>{/if}
      </div>
    </div>
  {:else if selectedClass}
    <div class="card"><div class="card-body text-center py-12 text-slate-400">No students in this class.</div></div>
  {/if}
</div>
