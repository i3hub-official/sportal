<!-- src/routes/(app)/results/[studentId]/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  function changeTerm(e: Event) {
    const termId = (e.target as HTMLSelectElement).value;
    goto(`?term=${termId}`);
  }

  const gradeColor: Record<string, string> = {
    A1: 'badge-green', B2: 'badge-green', B3: 'badge-green',
    C4: 'badge-blue',  C5: 'badge-blue',  C6: 'badge-blue',
    D7: 'badge-yellow',E8: 'badge-yellow',F9: 'badge-red',
    A:  'badge-green', B: 'badge-blue',   C: 'badge-yellow', F: 'badge-red',
  };
</script>

<svelte:head><title>{data.student.firstName} {data.student.lastName} Results — SMS</title></svelte:head>

<div class="max-w-2xl">
  <div class="page-header">
    <div>
      <h1 class="page-title">{data.student.firstName} {data.student.lastName}</h1>
      <p class="page-subtitle">{data.student.admissionNo} · {data.student.class?.name ?? '—'}</p>
    </div>
    <div class="flex gap-2">
      <a href="/students/{data.student.id}" class="btn-secondary">← Profile</a>
    </div>
  </div>

  <div class="flex items-center justify-between mb-5">
    <select onchange={changeTerm} class="input w-44">
      {#each data.terms as term}
        <option value={term.id} selected={term.id === data.selectedTermId}>{term.name}</option>
      {/each}
    </select>
    {#if data.avgScore}
      <div class="text-right">
        <p class="text-2xl font-bold text-slate-900">{data.avgScore}%</p>
        <p class="text-xs text-slate-400">Average Score</p>
      </div>
    {/if}
  </div>

  <div class="table-wrapper">
    <table class="table">
      <thead><tr><th>#</th><th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead>
      <tbody>
        {#each data.results as result, i}
          <tr>
            <td class="text-slate-400">{i + 1}</td>
            <td class="font-medium">{result.subject.name}</td>
            <td>{result.caScore ?? '—'}</td>
            <td>{result.examScore ?? '—'}</td>
            <td class="font-bold">{result.totalScore ?? '—'}</td>
            <td><span class="{gradeColor[result.grade ?? ''] ?? 'badge-gray'}">{result.grade ?? '—'}</span></td>
            <td class="text-sm text-slate-500">{result.remark ?? '—'}</td>
          </tr>
        {:else}
          <tr><td colspan="7" class="text-center py-10 text-slate-400">No results for this term.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
