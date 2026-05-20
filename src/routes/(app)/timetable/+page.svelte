<!-- src/routes/(app)/timetable/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData, ActionData } from './$types';
  import { 
    Calendar, Clock, Plus, X, Trash2, BookOpen, 
    User, Users, GraduationCap, AlertCircle, Check,
    ChevronRight, ChevronLeft, Edit2, Save
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let showAdd = $state(false);
  const days = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'];
  const dayAbbr: Record<string, string> = {
    'MONDAY': 'MON',
    'TUESDAY': 'TUE',
    'WEDNESDAY': 'WED',
    'THURSDAY': 'THU',
    'FRIDAY': 'FRI'
  };

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

  const selectedClassName = $derived(
    data.classes.find(c => c.id === data.selectedClassId)?.name || ''
  );
</script>

<svelte:head>
  <title>Timetable — SMS</title>
</svelte:head>

<div class="timetable-container">
  <div class="timetable-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <Calendar size={24} />
        </div>
        <div>
          <h1 class="page-title">Timetable</h1>
          <p class="page-subtitle">Class schedule management</p>
        </div>
      </div>
      {#if data.selectedClassId}
        <button onclick={() => showAdd = !showAdd} class="add-slot-btn">
          {#if showAdd}
            <X size={16} />
            Cancel
          {:else}
            <Plus size={16} />
            Add Slot
          {/if}
        </button>
      {/if}
    </div>

    {#if form?.error}
      <div class="error-alert">
        <AlertCircle size={16} />
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="success-alert">
        <Check size={16} />
        {form.success}
      </div>
    {/if}

    <div class="class-selector-card">
      <div class="card-body">
        <label class="selector-label">
          <GraduationCap size={16} />
          Select Class
        </label>
        <select onchange={changeClass} class="class-select">
          <option value="">Choose class…</option>
          {#each data.classes as cls}
            <option value={cls.id} selected={cls.id === data.selectedClassId}>
              {cls.name}
            </option>
          {/each}
        </select>
        {#if data.selectedClassId}
          <div class="selected-class-badge">
            <BookOpen size={12} />
            {selectedClassName}
          </div>
        {/if}
      </div>
    </div>

    {#if showAdd && data.selectedClassId}
      <div class="add-slot-card">
        <div class="card-header">
          <Clock size={18} />
          <h3>Add Timetable Slot</h3>
        </div>
        <div class="card-body">
          <form method="POST" action="?/addSlot" use:enhance class="add-slot-form">
            <input type="hidden" name="classId" value={data.selectedClassId} />
            
            <div class="form-group">
              <label class="form-label">Day</label>
              <select name="dayOfWeek" required class="form-input">
                {#each days as d}
                  <option value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                {/each}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Subject</label>
              <select name="subjectId" required class="form-input">
                <option value="">Select…</option>
                {#each data.subjects as s}
                  <option value={s.id}>{s.name}</option>
                {/each}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Teacher</label>
              <select name="teacherId" required class="form-input">
                <option value="">Select…</option>
                {#each data.staff as s}
                  <option value={s.id}>{s.firstName} {s.lastName}</option>
                {/each}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Start Time</label>
              <input type="time" name="startTime" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label class="form-label">End Time</label>
              <input type="time" name="endTime" required class="form-input" />
            </div>
            
            <button type="submit" class="submit-slot-btn">
              <Plus size={16} />
              Add Slot
            </button>
          </form>
        </div>
      </div>
    {/if}

    {#if data.selectedClassId}
      <div class="timetable-grid">
        {#each days as day}
          <div class="day-column">
            <div class="day-header">
              <span class="day-name">{day.slice(0, 3)}</span>
              <span class="day-full">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
            </div>
            <div class="slots-container">
              {#each slotsByDay[day] as slot}
                <div class="slot-card">
                  <div class="slot-subject">
                    <BookOpen size={12} />
                    <span class="subject-name">{slot.subject.name}</span>
                  </div>
                  <div class="slot-time">
                    <Clock size={10} />
                    <span>{slot.startTime} – {slot.endTime}</span>
                  </div>
                  <div class="slot-teacher">
                    <User size={10} />
                    <span>{slot.teacher.firstName} {slot.teacher.lastName}</span>
                  </div>
                  <form method="POST" action="?/deleteSlot" use:enhance class="remove-form">
                    <input type="hidden" name="slotId" value={slot.id} />
                    <button type="submit" class="remove-btn">
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </form>
                </div>
              {:else}
                <div class="empty-slot">
                  <Clock size={24} />
                  <p>No class</p>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state-card">
        <div class="empty-state-content">
          <Calendar size={48} class="empty-icon" />
          <p>Select a class to view its timetable</p>
          <span class="empty-hint">Choose a class from the dropdown above</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .timetable-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .timetable-wrapper {
    max-width: 80rem;
    margin: 0 auto;
  }

  /* Page Header */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .header-title-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .title-icon {
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.25rem 0;
  }

  .page-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .add-slot-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-slot-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Alerts */
  .error-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
  }

  .success-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
  }

  /* Class Selector Card */
  .class-selector-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .card-body {
    padding: 1rem 1.25rem;
  }

  .selector-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .class-select {
    width: 100%;
    max-width: 280px;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
  }

  .class-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .selected-class-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.75rem;
    padding: 0.25rem 0.625rem;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Add Slot Card */
  .add-slot-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1e293b;
  }

  .add-slot-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .submit-slot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    height: 2.5rem;
    align-self: flex-end;
  }

  .submit-slot-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Timetable Grid */
  .timetable-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .day-column {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .day-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0.75rem;
    text-align: center;
    color: white;
  }

  .day-name {
    display: block;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .day-full {
    display: block;
    font-size: 0.7rem;
    opacity: 0.9;
    margin-top: 0.125rem;
  }

  .slots-container {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 400px;
  }

  .slot-card {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    padding: 0.5rem;
    transition: all 0.15s ease;
  }

  .slot-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .slot-subject {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-weight: 600;
    color: #1e40af;
    margin-bottom: 0.25rem;
  }

  .subject-name {
    font-size: 0.8125rem;
  }

  .slot-time {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.7rem;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }

  .slot-teacher {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.7rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .remove-form {
    margin-top: 0.25rem;
  }

  .remove-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    color: #ef4444;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.65rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .remove-btn:hover {
    background: #fef2f2;
  }

  .empty-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 0.5rem;
    color: #cbd5e1;
    text-align: center;
  }

  .empty-slot p {
    font-size: 0.7rem;
    margin-top: 0.25rem;
  }

  /* Empty State Card */
  .empty-state-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    text-align: center;
    padding: 3rem;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-icon {
    color: #cbd5e1;
    margin-bottom: 0.5rem;
  }

  .empty-state-content p {
    color: #64748b;
    font-size: 0.875rem;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .timetable-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .timetable-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .timetable-grid {
      grid-template-columns: 1fr;
    }

    .add-slot-form {
      grid-template-columns: 1fr;
    }

    .submit-slot-btn {
      width: 100%;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .timetable-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .add-slot-btn {
      background: #3b82f6;
    }

    .add-slot-btn:hover {
      background: #2563eb;
    }

    .class-selector-card,
    .add-slot-card,
    .day-column,
    .empty-state-card {
      background: #1e293b;
      border-color: #334155;
    }

    .card-header {
      color: #f8fafc;
      border-bottom-color: #334155;
    }

    .class-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .class-select:focus {
      border-color: #3b82f6;
    }

    .selected-class-badge {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .form-input {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .form-input:focus {
      border-color: #3b82f6;
    }

    .slot-card {
      background: #1e2d4a;
      border-color: #2d4a7a;
    }

    .slot-subject {
      color: #93c5fd;
    }

    .slot-time {
      color: #60a5fa;
    }

    .slot-teacher {
      color: #94a3b8;
    }

    .remove-btn:hover {
      background: #7f1d1d;
    }

    .empty-slot {
      color: #475569;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>