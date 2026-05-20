<!-- src/routes/(app)/timetable/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData, ActionData } from './$types';
  import { 
    Calendar, Clock, BookOpen, User, MapPin, X, Plus, 
    GripVertical, AlertCircle, Info, ChevronDown, ChevronRight,
    Trash2, Move, DoorOpen, GraduationCap, Users, Loader2,
    Search, School
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // ── State ────────────────────────────────────────────────────────────────────
  let selectedClass = $state(data.selectedClassId ?? '');
  let showPanel     = $state(false);
  let panelDay      = $state('');
  let panelSlot     = $state<string | null>(null);
  let saving        = $state(false);
  let deletingId    = $state<string | null>(null);
  let dragSlot      = $state<any>(null);
  let dragOver      = $state<{ day: string; period: string } | null>(null);
  let error         = $state('');

  // Class dropdown states
  let classDropdownOpen = $state(false);
  let classSearch = $state('');

  // ── Panel form fields ────────────────────────────────────────────────────────
  let pSubject = $state('');
  let pTeacher = $state('');
  let pRoom    = $state('');

  // ── Config ───────────────────────────────────────────────────────────────────
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const DAY_SHORT: Record<string, string> = {
    MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri'
  };

  // School periods — 8 periods per day
  const PERIODS = [
    { label: '1st Period', start: '08:00', end: '08:40' },
    { label: '2nd Period', start: '08:40', end: '09:20' },
    { label: 'Break',      start: '09:20', end: '09:40', isBreak: true },
    { label: '3rd Period', start: '09:40', end: '10:20' },
    { label: '4th Period', start: '10:20', end: '11:00' },
    { label: 'Lunch',      start: '11:00', end: '11:30', isBreak: true },
    { label: '5th Period', start: '11:30', end: '12:10' },
    { label: '6th Period', start: '12:10', end: '12:50' },
    { label: '7th Period', start: '12:50', end: '13:30' },
    { label: '8th Period', start: '13:30', end: '14:10' },
  ];

  // Subject color palette
  const COLORS = [
    { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
    { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
    { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    { bg: '#cffafe', text: '#164e63', border: '#67e8f9' },
    { bg: '#dcfce7', text: '#14532d', border: '#86efac' },
    { bg: '#fef9c3', text: '#713f12', border: '#fde047' },
    { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
    { bg: '#ffedd5', text: '#7c2d12', border: '#fdba74' },
    { bg: '#f0fdf4', text: '#15803d', border: '#4ade80' },
  ];

  // Map subjectId → color
  const subjectColorMap = $derived(
    data.subjects.reduce((acc, s, i) => {
      acc[s.id] = COLORS[i % COLORS.length];
      return acc;
    }, {} as Record<string, typeof COLORS[0]>)
  );

  // ── Slot lookup ──────────────────────────────────────────────────────────────
  const slotMap = $derived(
    data.slots.reduce((acc, slot) => {
      const key = `${slot.dayOfWeek}::${slot.startTime}`;
      acc[key] = slot;
      return acc;
    }, {} as Record<string, any>)
  );

  // Get selected class label
  const selectedClassLabel = $derived(() => {
    const classItem = data.classes?.find(c => c.id === selectedClass);
    return classItem?.name || 'Choose class…';
  });

  // Filtered classes
  const filteredClasses = $derived(() => {
    if (!data.classes) return [];
    if (!classSearch) return data.classes;
    return data.classes.filter(c => 
      c.name.toLowerCase().includes(classSearch.toLowerCase())
    );
  });

  // ── Class change ─────────────────────────────────────────────────────────────
  function selectClass(classId: string) {
    selectedClass = classId;
    classDropdownOpen = false;
    classSearch = '';
    goto(`?class=${selectedClass}`, { replaceState: true });
    showPanel = false;
  }

  function clearClass() {
    selectedClass = '';
    classDropdownOpen = false;
    classSearch = '';
    goto(`?class=`, { replaceState: true });
    showPanel = false;
  }

  // ── Open add panel ───────────────────────────────────────────────────────────
  function openPanel(day: string, period: typeof PERIODS[0]) {
    if (period.isBreak) return;
    const existing = slotMap[`${day}::${period.start}`];
    if (existing) return;
    panelDay  = day;
    panelSlot = period.start;
    pSubject  = '';
    pTeacher  = '';
    pRoom     = '';
    error     = '';
    showPanel = true;
  }

  function closePanel() { showPanel = false; }

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  function onDragStart(e: DragEvent, slot: any) {
    dragSlot = slot;
    (e.target as HTMLElement).style.opacity = '0.4';
  }

  function onDragEnd(e: DragEvent) {
    (e.target as HTMLElement).style.opacity = '1';
    dragOver = null;
  }

  function onDragOver(e: DragEvent, day: string, period: typeof PERIODS[0]) {
    if (period.isBreak) return;
    e.preventDefault();
    dragOver = { day, period: period.start };
  }

  function onDragLeave() { dragOver = null; }

  async function onDrop(e: DragEvent, day: string, period: typeof PERIODS[0]) {
    e.preventDefault();
    dragOver = null;
    if (!dragSlot || period.isBreak) return;
    if (dragSlot.dayOfWeek === day && dragSlot.startTime === period.start) return;

    const target = slotMap[`${day}::${period.start}`];
    if (target) { error = 'That slot is already occupied'; return; }

    const [sh, sm] = dragSlot.startTime.split(':').map(Number);
    const [eh, em] = dragSlot.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    const [nh, nm] = period.start.split(':').map(Number);
    const newEndMin = nh * 60 + nm + duration;
    const newEnd = `${String(Math.floor(newEndMin / 60)).padStart(2, '0')}:${String(newEndMin % 60).padStart(2, '0')}`;

    const fd = new FormData();
    fd.append('slotId',    dragSlot.id);
    fd.append('dayOfWeek', day);
    fd.append('startTime', period.start);
    fd.append('endTime',   newEnd);

    const res = await fetch(`?/moveSlot`, { method: 'POST', body: fd });
    if (res.ok) goto(`?class=${selectedClass}`, { replaceState: true, invalidateAll: true });
    else error = 'Failed to move slot';

    dragSlot = null;
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  let deleteForm: HTMLFormElement;
  let deleteSlotId = $state('');

  async function deleteSlot(slotId: string) {
    if (!confirm('Remove this slot?')) return;
    deletingId  = slotId;
    deleteSlotId = slotId;
    await new Promise(r => setTimeout(r, 50));
    deleteForm.submit();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function subjectName(id: string) {
    return data.subjects.find(s => s.id === id)?.name ?? '—';
  }
  function teacherName(id: string) {
    const t = data.staff.find(s => s.id === id);
    return t ? `${t.firstName} ${t.lastName}` : '—';
  }

  const totalSlots = $derived(data.slots.length);
  const className  = $derived(data.classes.find(c => c.id === selectedClass)?.name ?? '');

  $effect(() => {
    if (form?.error) error = form.error;
    if (form?.success) { showPanel = false; error = ''; }
  });

  // Close dropdown when clicking outside
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      classDropdownOpen = false;
    }
  }
</script>

<svelte:head><title>Timetable — SMS</title></svelte:head>

<!-- Hidden delete form -->
<form bind:this={deleteForm} method="POST" action="?/deleteSlot" style="display:none">
  <input type="hidden" name="slotId" bind:value={deleteSlotId} />
</form>

<div class="tt-page" onclick={handleClickOutside}>

  <!-- ── Header ── -->
  <div class="tt-header">
    <div>
      <h1 class="tt-title">Timetable</h1>
      <p class="tt-sub">
        {#if selectedClass && className}
          {className} · {totalSlots} slot{totalSlots !== 1 ? 's' : ''}
        {:else}
          Select a class to build its schedule
        {/if}
      </p>
    </div>

    <div class="tt-header-right">
      <!-- Searchable Class Dropdown -->
      <div class="custom-dropdown" class:open={classDropdownOpen}>
        <button 
          type="button" 
          class="dropdown-trigger"
          onclick={(e) => { e.stopPropagation(); classDropdownOpen = !classDropdownOpen; }}
        >
          <School size={16} class="dropdown-school-icon" />
          <span class="dropdown-value">{selectedClassLabel()}</span>
          {#if selectedClass}
            <button 
              class="dropdown-clear" 
              onclick={(e) => { e.stopPropagation(); clearClass(); }}
              aria-label="Clear class"
            >
              <X size={14} />
            </button>
          {/if}
          <ChevronDown size={16} class="dropdown-icon" />
        </button>
        {#if classDropdownOpen}
          <div class="dropdown-menu">
            <div class="dropdown-search">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search class..." 
                bind:value={classSearch}
                onclick={(e) => e.stopPropagation()}
              />
            </div>
            <div class="dropdown-options">
              {#each filteredClasses() as cls}
                <div 
                  class="dropdown-option {selectedClass === cls.id ? 'selected' : ''}"
                  onclick={() => selectClass(cls.id)}
                >
                  {cls.name}
                </div>
              {:else}
                <div class="dropdown-empty">No classes found</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if error}
    <div class="tt-error">
      <div class="tt-error-content">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
      <button onclick={() => error = ''}>
        <X size={14} />
      </button>
    </div>
  {/if}

  {#if !selectedClass}
    <div class="empty-state">
      <div class="empty-icon">
        <Calendar size={56} />
      </div>
      <p class="empty-title">No class selected</p>
      <p class="empty-sub">Pick a class above to view or build its timetable</p>
    </div>

  {:else}
    <!-- ── Legend ── -->
    <div class="legend">
      <span class="legend-label">Subjects:</span>
      {#each data.subjects.slice(0, 8) as sub}
        {@const color = subjectColorMap[sub.id]}
        <span class="legend-chip" style="background:{color.bg}; color:{color.text}; border-color:{color.border}">
          {sub.name}
        </span>
      {/each}
      {#if data.subjects.length > 8}
        <span class="legend-more">+{data.subjects.length - 8} more</span>
      {/if}
    </div>

    <!-- ── Hint ── -->
    <div class="tt-hint">
      <Info size={14} />
      <span>Click an empty cell to add a lesson · Drag a lesson to move it</span>
    </div>

    <!-- ── Grid ── -->
    <div class="tt-grid-wrap">
      <div class="tt-grid">

        <!-- Corner -->
        <div class="tt-corner">
          <Clock size={16} />
        </div>

        <!-- Day headers -->
        {#each DAYS as day}
          <div class="tt-day-header">
            <span class="day-full">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
            <span class="day-short">{DAY_SHORT[day]}</span>
          </div>
        {/each}

        <!-- Rows: one per period -->
        {#each PERIODS as period}
          <!-- Period label -->
          <div class="tt-period-label {period.isBreak ? 'is-break' : ''}">
            <span class="period-name">{period.label}</span>
            <span class="period-time">{period.start}–{period.end}</span>
          </div>

          <!-- Cells: one per day -->
          {#each DAYS as day}
            {@const slot = slotMap[`${day}::${period.start}`]}
            {@const isTarget = dragOver?.day === day && dragOver?.period === period.start}
            {@const color = slot ? subjectColorMap[slot.subjectId] : null}

            {#if period.isBreak}
              <div class="tt-cell break-cell">
                <span>{period.label}</span>
              </div>

            {:else if slot}
              <div
                class="tt-cell filled-cell"
                style="background:{color?.bg}; border-color:{color?.border};"
                draggable="true"
                ondragstart={e => onDragStart(e, slot)}
                ondragend={onDragEnd}
                role="button"
                tabindex="0"
              >
                <div class="slot-subject" style="color:{color?.text}">
                  <BookOpen size={12} />
                  <span>{slot.subject.name}</span>
                </div>
                <div class="slot-teacher">
                  <User size={10} />
                  <span>{slot.teacher.firstName} {slot.teacher.lastName}</span>
                </div>
                {#if slot.room}
                  <div class="slot-room">
                    <DoorOpen size={10} />
                    <span>{slot.room}</span>
                  </div>
                {/if}
               <button
  class="slot-delete"
  onclick={(e) => {
    e.stopPropagation();
    deleteSlot(slot.id);
  }}
  aria-label="Remove slot"
  disabled={deletingId === slot.id}
>
  {#if deletingId === slot.id}
    <span class="loading-dots">…</span>
  {:else}
    <Trash2 size={12} />
  {/if}
</button>
                <div class="drag-handle" title="Drag to move">
                  <GripVertical size={12} />
                </div>
              </div>

            {:else}
              <div
                class="tt-cell empty-cell {isTarget ? 'drag-target' : ''}"
                ondragover={e => onDragOver(e, day, period)}
                ondragleave={onDragLeave}
                ondrop={e => onDrop(e, day, period)}
                onclick={() => openPanel(day, period)}
                role="button"
                tabindex="0"
                onkeydown={e => e.key === 'Enter' && openPanel(day, period)}
              >
                <span class="add-icon">
                  <Plus size={20} />
                </span>
              </div>
            {/if}
          {/each}
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- ── Add Lesson Side Panel ── -->
{#if showPanel}
  <div class="panel-backdrop" onclick={closePanel} role="button" tabindex="-1"></div>

  <div class="panel" role="dialog" aria-modal="true" aria-label="Add lesson">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">Add Lesson</h2>
        <p class="panel-sub">
          {panelDay.charAt(0) + panelDay.slice(1).toLowerCase()} · {panelSlot}
        </p>
      </div>
      <button onclick={closePanel} class="panel-close">
        <X size={18} />
      </button>
    </div>

    <form
      method="POST"
      action="?/addSlot"
      use:enhance={() => {
        saving = true;
        return async ({ update }) => { saving = false; update(); };
      }}
      class="panel-form"
    >
      <input type="hidden" name="classId"   value={selectedClass} />
      <input type="hidden" name="dayOfWeek" value={panelDay} />
      <input type="hidden" name="startTime" value={panelSlot ?? ''} />
      <input type="hidden" name="endTime"   value={PERIODS.find(p => p.start === panelSlot)?.end ?? ''} />

      <div class="panel-field">
        <label class="panel-label">Subject *</label>
        <select name="subjectId" required bind:value={pSubject} class="panel-select">
          <option value="">Choose subject…</option>
          {#each data.subjects as sub}
            <option value={sub.id}>{sub.name}</option>
          {/each}
        </select>
        {#if pSubject}
          {@const color = subjectColorMap[pSubject]}
          <div class="subject-preview" style="background:{color.bg}; color:{color.text}; border-color:{color.border}">
            <BookOpen size={12} />
            {subjectName(pSubject)}
          </div>
        {/if}
      </div>

      <div class="panel-field">
        <label class="panel-label">Teacher *</label>
        <select name="teacherId" required bind:value={pTeacher} class="panel-select">
          <option value="">Choose teacher…</option>
          {#each data.staff as s}
            <option value={s.id}>{s.firstName} {s.lastName} — {s.staffRole?.replace('_', ' ') ?? ''}</option>
          {/each}
        </select>
      </div>

      <div class="panel-field">
        <label class="panel-label">
          Room
          <span class="optional">(optional)</span>
        </label>
        <div class="room-input-wrapper">
          <MapPin size={14} class="room-icon" />
          <input 
            name="room" 
            bind:value={pRoom} 
            placeholder="e.g. Room 12, Science Lab…" 
            class="panel-input room-input" 
          />
        </div>
      </div>

      <div class="panel-field period-preview">
        <div class="preview-row">
          <span class="preview-key">
            <Calendar size={12} />
            Day
          </span>
          <span class="preview-val">{panelDay.charAt(0) + panelDay.slice(1).toLowerCase()}</span>
        </div>
        <div class="preview-row">
          <span class="preview-key">
            <Clock size={12} />
            Period
          </span>
          <span class="preview-val">{PERIODS.find(p => p.start === panelSlot)?.label}</span>
        </div>
        <div class="preview-row">
          <span class="preview-key">
            <Clock size={12} />
            Time
          </span>
          <span class="preview-val">{panelSlot} – {PERIODS.find(p => p.start === panelSlot)?.end}</span>
        </div>
      </div>

      <button type="submit" disabled={saving} class="panel-submit">
        {#if saving}
          <span class="btn-spinner"></span>
          Adding...
        {:else}
          <Plus size={16} />
          Add to Timetable
        {/if}
      </button>
    </form>
  </div>
{/if}

<style>
  /* ── Page ── */
  .tt-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }

  .tt-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .tt-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
  }
  .tt-sub { font-size: 0.875rem; color: #64748b; margin-top: 2px; }

  .tt-header-right { display: flex; align-items: center; gap: 0.75rem; }

  /* Custom Dropdown Styles */
  .custom-dropdown {
    position: relative;
    min-width: 220px;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 200px;
  }

  .dropdown-trigger:hover {
    border-color: #94a3b8;
  }

  .custom-dropdown.open .dropdown-trigger {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }

  .dropdown-school-icon {
    flex-shrink: 0;
    color: #64748b;
  }

  .dropdown-value {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-icon {
    flex-shrink: 0;
    color: #94a3b8;
    transition: transform 0.15s ease;
  }

  .custom-dropdown.open .dropdown-icon {
    transform: rotate(180deg);
  }

  .dropdown-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.15s ease;
  }

  .dropdown-clear:hover {
    color: #ef4444;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 50;
    overflow: hidden;
  }

  .dropdown-search {
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
  }

  .dropdown-search input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;
    background: transparent;
  }

  .dropdown-search input::placeholder {
    color: #cbd5e1;
  }

  .dropdown-options {
    max-height: 240px;
    overflow-y: auto;
  }

  .dropdown-option {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .dropdown-option:hover {
    background: #f1f5f9;
  }

  .dropdown-option.selected {
    background: #eff6ff;
    color: #2563eb;
  }

  .dropdown-empty {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #94a3b8;
    text-align: center;
  }

  .tt-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    color: #991b1b;
    font-size: 0.875rem;
  }
  .tt-error-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .tt-error button {
    background: none; border: none; cursor: pointer;
    color: #991b1b; display: flex; align-items: center; justify-content: center;
  }

  /* ── Empty state ── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    text-align: center;
  }
  .empty-icon { 
    color: #cbd5e1;
    margin-bottom: 1rem; 
  }
  .empty-title { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-bottom: 0.375rem; }
  .empty-sub { font-size: 0.875rem; color: #94a3b8; }

  /* ── Legend ── */
  .legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .legend-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
  .legend-chip {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid;
  }
  .legend-more { font-size: 0.75rem; color: #94a3b8; }

  /* ── Hint ── */
  .tt-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #94a3b8;
    background: #f8fafc;
    border: 1px dashed #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem 0.875rem;
  }

  /* ── Grid ── */
  .tt-grid-wrap {
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
    flex: 1;
  }

  .tt-grid {
    display: grid;
    grid-template-columns: 120px repeat(5, 1fr);
    min-width: 700px;
  }

  .tt-corner {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 0.75rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
  }

  .tt-day-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 0.75rem 0.5rem;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .day-short { display: none; }
  @media (max-width: 900px) {
    .day-full { display: none; }
    .day-short { display: inline; }
  }

  .tt-period-label {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
    justify-content: center;
  }
  .tt-period-label.is-break {
    background: #fefce8;
  }
  .period-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #334155;
  }
  .period-time {
    font-size: 0.65rem;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }

  .tt-cell {
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    min-height: 72px;
    position: relative;
  }
  .tt-cell:last-child { border-right: none; }

  .break-cell {
    background: #fefce8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #a16207;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .empty-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 150ms;
  }
  .empty-cell:hover { background: #f0f9ff; }
  .empty-cell.drag-target {
    background: #dbeafe;
    border: 2px dashed #3b82f6;
  }
  .add-icon {
    color: #cbd5e1;
    line-height: 1;
    transition: color 150ms, transform 150ms;
  }
  .empty-cell:hover .add-icon { color: #3b82f6; transform: scale(1.2); }

  .filled-cell {
    padding: 0.5rem 0.625rem;
    border: 1.5px solid;
    cursor: grab;
    user-select: none;
    transition: transform 120ms, box-shadow 120ms;
  }
  .filled-cell:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 2;
  }
  .filled-cell:active { cursor: grabbing; }

  .slot-subject {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.25rem;
  }
  .slot-teacher {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    opacity: 0.75;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .slot-room {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.65rem;
    opacity: 0.65;
    margin-top: 2px;
  }

  .slot-delete {
    position: absolute;
    top: 4px; right: 4px;
    width: 20px; height: 20px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,0.12);
    color: inherit;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    transition: background 150ms;
  }
  .slot-delete:hover { background: rgba(239,68,68,0.3); }
  .filled-cell:hover .slot-delete { display: flex; }

  .drag-handle {
    position: absolute;
    bottom: 4px; right: 4px;
    opacity: 0.3;
    pointer-events: none;
  }

  /* ── Side Panel ── */
  .panel-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(2px);
    z-index: 39;
  }

  .panel {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 360px;
    max-width: 100vw;
    background: white;
    box-shadow: -8px 0 40px rgba(0,0,0,0.12);
    z-index: 40;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.22s cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }
  .panel-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
  }
  .panel-sub { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
  .panel-close {
    width: 32px; height: 32px;
    border: none; background: #f1f5f9;
    border-radius: 0.5rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 150ms;
  }
  .panel-close:hover { background: #e2e8f0; }

  .panel-form {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  .panel-field { display: flex; flex-direction: column; gap: 0.375rem; }
  .panel-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #475569;
  }
  .optional { font-weight: 400; color: #94a3b8; }

  .room-input-wrapper {
    position: relative;
  }
  .room-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
  }
  .room-input {
    padding-left: 2.25rem !important;
  }

  .panel-select, .panel-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #0f172a;
    background: white;
    transition: border-color 150ms, box-shadow 150ms;
  }
  .panel-select:focus, .panel-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }

  .subject-preview {
    margin-top: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .period-preview {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.75rem;
    gap: 0 !important;
  }
  .preview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .preview-row:last-child { border-bottom: none; }
  .preview-key { 
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem; 
    color: #94a3b8; 
  }
  .preview-val { font-size: 0.75rem; font-weight: 600; color: #334155; }

  .panel-submit {
    margin-top: auto;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.625rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 150ms, transform 100ms;
  }
  .panel-submit:hover:not(:disabled) { background: #1d4ed8; }
  .panel-submit:active:not(:disabled) { transform: scale(0.98); }
  .panel-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .tt-title {
      color: #f8fafc;
    }

    .dropdown-trigger {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .dropdown-menu {
      background: #1e293b;
      border-color: #475569;
    }

    .dropdown-search {
      border-bottom-color: #475569;
    }

    .dropdown-search input {
      color: #f8fafc;
    }

    .dropdown-option {
      color: #cbd5e1;
    }

    .dropdown-option:hover {
      background: #334155;
    }

    .dropdown-option.selected {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .tt-grid-wrap {
      background: #1e293b;
      border-color: #334155;
    }

    .tt-corner,
    .tt-day-header,
    .tt-period-label {
      background: #0f172a;
      border-color: #334155;
      color: #94a3b8;
    }

    .tt-cell {
      border-color: #334155;
    }

    .empty-cell:hover {
      background: #1e293b;
    }

    .filled-cell {
      background: #1e293b;
    }

    .panel {
      background: #1e293b;
    }

    .panel-header {
      border-bottom-color: #334155;
    }

    .panel-title {
      color: #f8fafc;
    }

    .panel-select,
    .panel-input {
      background: #0f172a;
      border-color: #475569;
      color: #f8fafc;
    }

    .period-preview {
      background: #0f172a;
      border-color: #334155;
    }

    .preview-val {
      color: #f8fafc;
    }
  }
</style>