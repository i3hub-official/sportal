<!-- src/routes/(app)/attendance/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { 
    Users, CheckSquare, Save, Download, 
    Check, X, Clock, AlertCircle, UserCheck, UserX,
    Loader2, TrendingUp, TrendingDown, Activity
  } from 'lucide-svelte';

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

  const statusIcon: Record<string, any> = {
    PRESENT: Check,
    ABSENT: X,
    LATE: Clock,
    EXCUSED: AlertCircle
  };

  // Calculate summary stats
  const summary = $derived({
    total: students.length,
    present: students.filter(s => s.status === 'PRESENT').length,
    absent: students.filter(s => s.status === 'ABSENT').length,
    late: students.filter(s => s.status === 'LATE').length,
    excused: students.filter(s => s.status === 'EXCUSED').length,
    attendanceRate: students.length > 0 
      ? ((students.filter(s => s.status === 'PRESENT').length / students.length) * 100).toFixed(1)
      : 0
  });
</script>

<svelte:head>
  <title>Attendance — SMS</title>
</svelte:head>

<div class="attendance-container">
  <div class="attendance-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <CheckSquare size={24} />
        </div>
        <div>
          <h1 class="page-title">Attendance</h1>
          <p class="page-subtitle">Mark daily student attendance</p>
        </div>
      </div>
    </div>

    <div class="filters-card">
      <div class="filters-body">
        <div class="filter-group">
          <label class="filter-label">Class *</label>
          <select bind:value={selectedClass} onchange={loadAttendance} class="filter-select">
            <option value="">Select class…</option>
            {#each data.classes as cls}
              <option value={cls.id}>{cls.name}</option>
            {/each}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Date *</label>
          <div class="date-input-wrapper">
            <input 
              type="date" 
              bind:value={selectedDate} 
              onchange={loadAttendance} 
              class="date-input"
              max={new Date().toISOString().slice(0, 10)} 
            />
          </div>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="loading-state">
        <Loader2 size={32} class="spinning" />
        <p>Loading attendance data...</p>
      </div>
    {:else if students.length > 0}
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-icon">
            <Users size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Total Students</p>
            <p class="summary-value">{summary.total}</p>
          </div>
        </div>
        <div class="summary-card present">
          <div class="summary-icon">
            <UserCheck size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Present</p>
            <p class="summary-value">{summary.present}</p>
          </div>
        </div>
        <div class="summary-card absent">
          <div class="summary-icon">
            <UserX size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Absent</p>
            <p class="summary-value">{summary.absent}</p>
          </div>
        </div>
        <div class="summary-card late">
          <div class="summary-icon">
            <Clock size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Late</p>
            <p class="summary-value">{summary.late}</p>
          </div>
        </div>
        <div class="summary-card rate">
          <div class="summary-icon">
            <Activity size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Attendance Rate</p>
            <p class="summary-value">{summary.attendanceRate}%</p>
          </div>
        </div>
      </div>

      <div class="attendance-card">
        <div class="card-header">
          <div class="header-info">
            <Users size={16} />
            <span>{students.length} students</span>
          </div>
          <div class="quick-actions">
            {#each statusOptions as s}
              <button onclick={() => setAll(s)} class="quick-action-btn">
                {#if s === 'PRESENT'}
                  <Check size={12} />
                {:else if s === 'ABSENT'}
                  <X size={12} />
                {:else if s === 'LATE'}
                  <Clock size={12} />
                {:else}
                  <AlertCircle size={12} />
                {/if}
                {s.slice(0, 3)} All
              </button>
            {/each}
          </div>
        </div>
        
        <div class="table-wrapper">
          <table class="attendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each students as student, i}
                <tr class="student-row">
                  <td class="row-number">{i + 1}</td>
                  <td class="student-name-cell">
                    <div class="student-avatar">
                      {student.studentName?.charAt(0) || 'S'}
                    </div>
                    <span>{student.studentName}</span>
                  </td>
                  <td class="status-buttons">
                    <div class="status-btn-group">
                      {#each statusOptions as s}
                        {@const Icon = statusIcon[s]}
                        <button
                          onclick={() => student.status = s}
                          class="status-btn {student.status === s ? 'active' : ''} {s.toLowerCase()}"
                          title={s.toLowerCase()}
                        >
                          <Icon size={14} />
                        </button>
                      {/each}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <div class="card-footer">
          <button onclick={saveAttendance} disabled={saving} class="save-btn">
            {#if saving}
              <Loader2 size={16} class="spinning" />
              Saving...
            {:else}
              <Save size={16} />
              Save Attendance
            {/if}
          </button>
          {#if saved}
            <div class="saved-indicator">
              <Check size={14} />
              Saved!
            </div>
          {/if}
        </div>
      </div>
    {:else if selectedClass}
      <div class="empty-state">
        <Users size={48} class="empty-icon" />
        <p>No students in this class</p>
        <span class="empty-hint">Please check another class or add students</span>
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

  .attendance-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .attendance-wrapper {
    max-width: 80rem;
    margin: 0 auto;
  }

  /* Page Header */
  .page-header {
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

  /* Filters Card */
  .filters-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .filters-body {
    padding: 1rem 1.25rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-group {
    flex: 1;
    min-width: 180px;
  }

  .filter-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .date-input-wrapper {
    position: relative;
  }

  .date-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
  }

  .date-input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .date-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: #64748b;
  }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.15s ease;
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .summary-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summary-card.total .summary-icon {
    background: #eff6ff;
    color: #2563eb;
  }

  .summary-card.present .summary-icon {
    background: #ecfdf5;
    color: #10b981;
  }

  .summary-card.absent .summary-icon {
    background: #fef2f2;
    color: #ef4444;
  }

  .summary-card.late .summary-icon {
    background: #fffbeb;
    color: #f59e0b;
  }

  .summary-card.rate .summary-icon {
    background: #f5f3ff;
    color: #8b5cf6;
  }

  .summary-info {
    flex: 1;
  }

  .summary-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
  }

  .summary-card.rate .summary-value {
    font-size: 1.25rem;
  }

  /* Attendance Card */
  .attendance-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }

  .quick-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .quick-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .quick-action-btn:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }

  /* Table */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .attendance-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .attendance-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .attendance-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .attendance-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .student-row:hover td {
    background: #f8fafc;
  }

  .row-number {
    color: #94a3b8;
    width: 50px;
  }

  .student-name-cell {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-weight: 500;
    color: #0f172a;
  }

  .student-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #dbeafe;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Status Buttons */
  .status-buttons {
    width: 200px;
  }

  .status-btn-group {
    display: flex;
    gap: 0.375rem;
  }

  .status-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .status-btn:hover {
    transform: scale(1.05);
  }

  .status-btn.active.present,
  .status-btn.present.active {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }

  .status-btn.active.absent,
  .status-btn.absent.active {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
  }

  .status-btn.active.late,
  .status-btn.late.active {
    background: #f59e0b;
    border-color: #f59e0b;
    color: white;
  }

  .status-btn.active.excused,
  .status-btn.excused.active {
    background: #64748b;
    border-color: #64748b;
    color: white;
  }

  .status-btn:not(.active) {
    color: #94a3b8;
  }

  .status-btn:not(.active):hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  /* Card Footer */
  .card-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .save-btn {
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

  .save-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .save-btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .saved-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #10b981;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
  }

  .empty-icon {
    color: #cbd5e1;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Spinner */
  .spinning {
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .attendance-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .summary-value {
      font-size: 1.25rem;
    }

    .card-header {
      flex-direction: column;
      align-items: stretch;
    }

    .quick-actions {
      justify-content: center;
    }

    .status-buttons {
      width: auto;
    }

    .status-btn-group {
      flex-wrap: wrap;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .attendance-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .filters-card,
    .attendance-card,
    .summary-card,
    .empty-state {
      background: #1e293b;
      border-color: #334155;
    }

    .filter-select,
    .date-input {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .filter-select:focus,
    .date-input:focus {
      border-color: #3b82f6;
    }

    .summary-value {
      color: #f8fafc;
    }

    .attendance-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .attendance-table th {
      color: #94a3b8;
    }

    .attendance-table td {
      border-bottom-color: #334155;
    }

    .student-row:hover td {
      background: #0f172a;
    }

    .student-name-cell {
      color: #f8fafc;
    }

    .student-avatar {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .status-btn {
      background: #1e293b;
      border-color: #475569;
    }

    .status-btn:not(.active) {
      color: #64748b;
    }

    .status-btn:not(.active):hover {
      background: #334155;
    }

    .quick-action-btn {
      background: #334155;
      color: #cbd5e1;
    }

    .quick-action-btn:hover {
      background: #475569;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>