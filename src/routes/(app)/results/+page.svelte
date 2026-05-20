<!-- src/routes/(app)/results/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  let selectedClass   = $state('');
  let selectedTerm    = $state(data.currentTerm?.id ?? '');
  let selectedSubject = $state('');
  let students        = $state<any[]>([]);
  let loading         = $state(false);

  async function loadStudents() {
    if (!selectedClass || !selectedTerm) return;
    loading = true;
    const res = await fetch(`/api/results?classId=${selectedClass}&termId=${selectedTerm}&subjectId=${selectedSubject}`);
    const json = await res.json();
    students = json.data ?? [];
    loading = false;
  }

  async function saveScore(resultId: string | null, studentId: string, subjectId: string, field: string, value: string) {
    await fetch('/api/results', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        resultId, studentId, subjectId,
        classId: selectedClass,
        termId:  selectedTerm,
        [field]: parseFloat(value) || 0,
      }),
    });
  }
</script>

<svelte:head><title>Results — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div><h1 class="page-title">Results</h1><p class="page-subtitle">Enter and manage student scores</p></div>
  </div>

  <!-- Filters -->
  <div class="card mb-5">
    <div class="card-body flex flex-wrap gap-3 items-end">
      <div>
        <label class="label">Term *</label>
        <select bind:value={selectedTerm} onchange={loadStudents} class="input w-44">
          <option value="">Select term…</option>
          {#each data.terms as term}
            <option value={term.id}>{term.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="label">Class *</label>
        <select bind:value={selectedClass} onchange={loadStudents} class="input w-40">
          <option value="">Select class…</option>
          {#each data.classes as cls}
            <option value={cls.id}>{cls.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="label">Subject</label>
        <select bind:value={selectedSubject} onchange={loadStudents} class="input w-48">
          <option value="">All subjects</option>
          {#each data.subjects as sub}
            <option value={sub.id}>{sub.name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-12"><div class="spinner w-8 h-8 border-blue-600"></div></div>
  {:else if students.length > 0}
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>CA (40)</th>
            <th>Exam (60)</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {#each students as row}
            <tr>
              <td>
                <a href="/results/{row.studentId}" class="font-medium text-blue-600 hover:underline">
                  {row.studentName}
                </a>
              </td>
              <td class="text-sm">{row.subjectName}</td>
              <td>
                <input type="number" min="0" max="40" value={row.caScore ?? 0}
                  onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'caScore', (e.target as HTMLInputElement).value)}
                  class="input w-20 text-center py-1" />
              </td>
              <td>
                <input type="number" min="0" max="60" value={row.examScore ?? 0}
                  onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'examScore', (e.target as HTMLInputElement).value)}
                  class="input w-20 text-center py-1" />
              </td>
              <td class="font-semibold">{row.totalScore ?? '—'}</td>
              <td><span class="badge-blue">{row.grade ?? '—'}</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if selectedClass && selectedTerm}
    <div class="card">
      <div class="card-body text-center py-12 text-slate-400">
        No results found. Select filters and scores will appear here.
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="card-body text-center py-12 text-slate-400">
        Select a term and class to load results.
      </div>
    </div>
  {/if}
</div>
