<!-- src/routes/(app)/timetable/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showAdd = $state(false);
  const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];

  function changeClass(e: Event) {
    const classId = (e.target as HTMLSelectElement).value;
    goto(`?class=${classId}`);
  }

  const slotsByDay = $derived(
    days.reduce((acc, day) => {
      acc[day] = data.slots.filter((s: any) => s.dayOfWeek === day);
      return acc;
    }, {} as Record<string, any[]>)
  );
</script>

<svelte:head><title>Timetable — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div><h1 class="page-title">Timetable</h1><p class="page-subtitle">Class schedule management</p></div>
    {#if data.selectedClassId}
      <button onclick={() => showAdd = !showAdd} class="btn-primary">{showAdd ? '✕ Cancel' : '+ Add Slot'}</button>
    {/if}
  </div>

  <div class="card mb-5">
    <div class="card-body">
      <label class="label">Select Class</label>
      <select onchange={changeClass} class="input w-48">
        <option value="">Choose class…</option>
        {#each data.classes as cls}
          <option value={cls.id} selected={cls.id === data.selectedClassId}>{cls.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if showAdd && data.selectedClassId}
    <div class="card mb-5">
      <div class="card-header"><p class="font-semibold">Add Timetable Slot</p></div>
      <div class="card-body">
        <form method="POST" action="?/addSlot" use:enhance class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <input type="hidden" name="classId" value={data.selectedClassId} />
          <div>
            <label class="label">Day</label>
            <select name="dayOfWeek" required class="input">
              {#each days as d}<option value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>{/each}
            </select>
          </div>
          <div>
            <label class="label">Subject</label>
            <select name="subjectId" required class="input">
              <option value="">Select…</option>
              {#each data.subjects as s}<option value={s.id}>{s.name}</option>{/each}
            </select>
          </div>
          <div>
            <label class="label">Teacher</label>
            <select name="teacherId" required class="input">
              <option value="">Select…</option>
              {#each data.staff as s}<option value={s.id}>{s.firstName} {s.lastName}</option>{/each}
            </select>
          </div>
          <div>
            <label class="label">Start Time</label>
            <input type="time" name="startTime" required class="input" />
          </div>
          <div>
            <label class="label">End Time</label>
            <input type="time" name="endTime" required class="input" />
          </div>
          <div class="flex items-end">
            <button type="submit" class="btn-primary w-full">Add</button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  {#if data.selectedClassId}
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {#each days as day}
        <div class="card">
          <div class="card-header py-2.5"><p class="text-xs font-bold text-slate-600 uppercase tracking-wide">{day.slice(0,3)}</p></div>
          <div class="p-2 space-y-2">
            {#each slotsByDay[day] as slot}
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs">
                <p class="font-semibold text-blue-800">{slot.subject.name}</p>
                <p class="text-blue-600">{slot.startTime} – {slot.endTime}</p>
                <p class="text-slate-500 mt-0.5">{slot.teacher.firstName} {slot.teacher.lastName}</p>
                <form method="POST" action="?/deleteSlot" use:enhance class="mt-1.5">
                  <input type="hidden" name="slotId" value={slot.id} />
                  <button type="submit" class="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </form>
              </div>
            {:else}
              <p class="text-xs text-slate-300 text-center py-3">Empty</p>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="card"><div class="card-body text-center py-12 text-slate-400">Select a class to view its timetable.</div></div>
  {/if}
</div>
