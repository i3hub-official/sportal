<!-- src/routes/(app)/subjects/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showAdd = $state(false);
  $effect(() => { if (form?.success) showAdd = false; });
</script>

<svelte:head><title>Subjects — SMS</title></svelte:head>

<div class="max-w-3xl">
  <div class="page-header">
    <div><h1 class="page-title">Subjects</h1><p class="page-subtitle">{data.subjects.length} subjects</p></div>
    <button onclick={() => showAdd = !showAdd} class="btn-primary">{showAdd ? '✕ Cancel' : '+ Add Subject'}</button>
  </div>

  {#if form?.error}<div class="alert-error mb-4 rounded-xl">{form.error}</div>{/if}

  {#if showAdd}
    <div class="card mb-5">
      <div class="card-body">
        <form method="POST" action="?/create" use:enhance class="flex gap-3 items-end">
          <div class="flex-1"><label class="label">Subject Name *</label><input name="name" required placeholder="Mathematics" class="input" /></div>
          <div class="w-28"><label class="label">Code *</label><input name="code" required placeholder="MTH" class="input uppercase" /></div>
          <button type="submit" class="btn-primary">Add</button>
        </form>
      </div>
    </div>
  {/if}

  <div class="table-wrapper">
    <table class="table">
      <thead><tr><th>Subject</th><th>Code</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {#each data.subjects as subject}
          <tr>
            <td class="font-medium">{subject.name}</td>
            <td><span class="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{subject.code}</span></td>
            <td><span class="{subject.isActive ? 'badge-green' : 'badge-gray'}">{subject.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
              <form method="POST" action="?/toggle" use:enhance>
                <input type="hidden" name="subjectId" value={subject.id} />
                <button type="submit" class="btn-ghost btn-sm {subject.isActive ? 'text-red-500' : 'text-emerald-600'}">
                  {subject.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </form>
            </td>
          </tr>
        {:else}
          <tr><td colspan="4" class="text-center py-10 text-slate-400">No subjects yet.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
