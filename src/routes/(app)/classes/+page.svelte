<!-- src/routes/(app)/classes/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showAdd = $state(false);

  const levelColor: Record<string, string> = {
    NURSERY: 'badge-purple', PRIMARY: 'badge-blue', SECONDARY: 'badge-green'
  };

  $effect(() => { if (form?.createSuccess) showAdd = false; });

  const byLevel = $derived({
    NURSERY:   data.classes.filter(c => c.level === 'NURSERY'),
    PRIMARY:   data.classes.filter(c => c.level === 'PRIMARY'),
    SECONDARY: data.classes.filter(c => c.level === 'SECONDARY'),
  });
</script>

<svelte:head><title>Classes — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div>
      <h1 class="page-title">Classes</h1>
      <p class="page-subtitle">{data.classes.length} classes · {data.academicYear?.name ?? ''}</p>
    </div>
    <button onclick={() => showAdd = !showAdd} class="btn-primary">
      {showAdd ? '✕ Cancel' : '+ New Class'}
    </button>
  </div>

  {#if form?.createError}<div class="alert-error mb-4 rounded-xl">{form.createError}</div>{/if}

  <!-- Add class form -->
  {#if showAdd}
    <div class="card mb-6">
      <div class="card-header"><h3 class="font-semibold text-slate-800">Add New Class</h3></div>
      <div class="card-body">
        <form method="POST" action="?/create" use:enhance class="flex flex-wrap gap-3 items-end">
          <div>
            <label class="label">Class Name *</label>
            <input name="name" required placeholder="JSS 1C" class="input w-36" />
          </div>
          <div>
            <label class="label">Level *</label>
            <select name="level" required class="input w-36">
              <option value="">Select…</option>
              <option value="NURSERY">Nursery</option>
              <option value="PRIMARY">Primary</option>
              <option value="SECONDARY">Secondary</option>
            </select>
          </div>
          <div>
            <label class="label">Section</label>
            <input name="section" placeholder="A" class="input w-20" />
          </div>
          <div>
            <label class="label">Class Teacher</label>
            <select name="classTeacherId" class="input w-48">
              <option value="">— Assign later —</option>
              {#each data.staff as s}
                <option value={s.id}>{s.firstName} {s.lastName}</option>
              {/each}
            </select>
          </div>
          <button type="submit" class="btn-primary">Create</button>
        </form>
      </div>
    </div>
  {/if}

  <!-- Classes by level -->
  {#each Object.entries(byLevel) as [lvl, classes]}
    {#if classes.length > 0}
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{lvl}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {#each classes as cls}
            <div class="card p-4 flex flex-col gap-3">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-semibold text-slate-800">{cls.name}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{cls._count.students} student{cls._count.students !== 1 ? 's' : ''}</p>
                </div>
                <span class="{levelColor[cls.level]}">{cls.section ?? ''}</span>
              </div>

              <div class="text-xs text-slate-500">
                <span class="font-medium">Class Teacher:</span>
                {cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 'Not assigned'}
              </div>

              <form method="POST" action="?/assignTeacher" use:enhance class="flex gap-2">
                <input type="hidden" name="classId" value={cls.id} />
                <select name="classTeacherId" class="input text-xs py-1 flex-1">
                  <option value="">Remove teacher</option>
                  {#each data.staff as s}
                    <option value={s.id} selected={s.id === cls.classTeacherId}>{s.firstName} {s.lastName}</option>
                  {/each}
                </select>
                <button type="submit" class="btn-secondary btn-sm">Set</button>
              </form>

              <a href="/classes/{cls.id}" class="btn-ghost btn-sm text-center">View Class →</a>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
