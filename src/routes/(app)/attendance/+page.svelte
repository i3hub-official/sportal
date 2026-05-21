<!-- src/routes/(app)/attendance/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { 
    Users, CheckSquare, Save, Download, 
    Check, X, Clock, AlertCircle, UserCheck, UserX,
    Loader2, TrendingUp, TrendingDown, Activity,
    Search, ChevronDown, Calendar as CalendarIcon,
    ChevronLeft, ChevronRight, Shield, Lock
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedClass = $state('');
  let selectedDate  = $state(new Date());
  let students      = $state<any[]>([]);
  let loading       = $state(false);
  let saving        = $state(false);
  let saved         = $state(false);
  let canEdit       = $state(false);
  let isHeadmaster  = $state(data.userRole === 'SUPER_ADMIN');

  // Class dropdown states
  let classDropdownOpen = $state(false);
  let classSearch = $state('');

  // Calendar states
  let showCalendar = $state(false);
  let currentCalendarDate = $state(new Date());

  // Get selected class label
  const selectedClassLabel = $derived(() => {
    const classItem = data.classes?.find(c => c.id === selectedClass);
    return classItem?.name || 'Select class…';
  });

  // Filtered classes
  const filteredClasses = $derived(() => {
    if (!data.classes) return [];
    if (!classSearch) return data.classes;
    return data.classes.filter(c => 
      c.name.toLowerCase().includes(classSearch.toLowerCase())
    );
  });

  // Format date for display
  const formattedDate = $derived(() => {
    return selectedDate.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Check if selected date is today
  const isToday = $derived(() => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  });

  // Format date for API
  const apiDate = $derived(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Get days in current month
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Get first day of month (0 = Sunday)
  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  // Generate calendar days
  function getCalendarDays() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const daysFromPrevMonth = firstDay;
    const totalCells = 42;
    const daysFromNextMonth = totalCells - (daysFromPrevMonth + daysInMonth);
    
    const days = [];
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date: prevDate,
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: isSameDay(prevDate, new Date()),
        isSelected: isSameDay(prevDate, selectedDate)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        day: i,
        isCurrentMonth: true,
        isToday: isSameDay(currentDate, new Date()),
        isSelected: isSameDay(currentDate, selectedDate)
      });
    }
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        day: i,
        isCurrentMonth: false,
        isToday: isSameDay(nextDate, new Date()),
        isSelected: isSameDay(nextDate, selectedDate)
      });
    }
    
    return days;
  }

  function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  const calendarDays = $derived(getCalendarDays());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function goToPreviousMonth() {
    currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
  }

  function goToNextMonth() {
    currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
  }

  async function selectDate(date: Date) {
    selectedDate = date;
    showCalendar = false;
    await loadAttendance();
  }

  async function loadAttendance() {
    if (!selectedClass || !apiDate()) return;
    loading = true;
    try {
      const res = await fetch(`/api/attendance/get?classId=${selectedClass}&date=${apiDate()}`);
      const json = await res.json();
      students = json.data ?? [];
      canEdit = json.canEditAny || false;
    } catch (error) {
      console.error('Failed to load attendance:', error);
      students = [];
    } finally {
      loading = false;
    }
  }

  function selectClass(classId: string) {
    selectedClass = classId;
    classDropdownOpen = false;
    classSearch = '';
    loadAttendance();
  }

  function clearClass() {
    selectedClass = '';
    classDropdownOpen = false;
    classSearch = '';
    students = [];
  }

  function setAll(status: string) {
    if (!canEdit && !isHeadmaster && !isToday()) {
      alert('You can only modify today\'s attendance');
      return;
    }
    students = students.map(s => ({ ...s, status }));
  }

  async function saveAttendance() {
    if (!canEdit && !isHeadmaster && !isToday()) {
      alert('Teachers can only save attendance for the current day');
      return;
    }
    
    saving = true;
    try {
      const records = students.map(s => ({
        studentId: s.studentId,
        status: s.status,
        note: s.note
      }));
      
      const res = await fetch('/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classId: selectedClass, 
          date: apiDate(), 
          records 
        }),
      });
      
      const result = await res.json();
      if (result.success) {
        saved = true;
        setTimeout(() => saved = false, 3000);
        await loadAttendance();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Failed to save attendance');
    } finally {
      saving = false;
    }
  }

  function updateStudentStatus(student: any, status: string) {
    if (!canEdit && !isHeadmaster && !isToday()) {
      alert('Teachers can only modify today\'s attendance');
      return;
    }
    student.status = status;
  }

  const statusOptions = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  const statusIcon: Record<string, any> = {
    PRESENT: Check,
    ABSENT: X,
    LATE: Clock,
    EXCUSED: AlertCircle
  };

  const statusLabels: Record<string, string> = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
    EXCUSED: 'Excused'
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

  // Close dropdowns when clicking outside
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      classDropdownOpen = false;
    }
    if (!target.closest('.calendar-container')) {
      showCalendar = false;
    }
  }
</script>

<svelte:head>
  <title>Attendance — SMS</title>
</svelte:head>

<div class="attendance-container" onclick={handleClickOutside}>
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
      {#if isHeadmaster}
        <div class="role-badge headmaster">
          <Shield size={14} />
          <span>Headmaster Access - Full Control</span>
        </div>
      {:else if !canEdit && selectedClass && !isToday()}
        <div class="role-badge readonly">
          <Lock size={14} />
          <span>Read Only - Past attendance cannot be modified</span>
        </div>
      {:else if selectedClass && isToday()}
        <div class="role-badge editable">
          <CheckSquare size={14} />
          <span>Editable - Current day attendance</span>
        </div>
      {/if}
    </div>

    <div class="filters-card">
      <div class="filters-body">
        <div class="filter-group">
          <label class="filter-label">Class *</label>
          <div class="custom-dropdown" class:open={classDropdownOpen}>
            <button 
              type="button" 
              class="dropdown-trigger"
              onclick={(e) => { e.stopPropagation(); classDropdownOpen = !classDropdownOpen; }}
            >
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

        <div class="filter-group">
          <label class="filter-label">Date *</label>
          <div class="calendar-container">
            <button 
              type="button" 
              class="calendar-trigger"
              onclick={(e) => { e.stopPropagation(); showCalendar = !showCalendar; }}
            >
              <CalendarIcon size={16} />
              <span class="calendar-value">{formattedDate()}</span>
              <ChevronDown size={16} class="calendar-icon" />
            </button>
            
            {#if showCalendar}
              <div class="calendar-dropdown">
                <div class="calendar-header">
                  <button onclick={(e) => { e.stopPropagation(); goToPreviousMonth(); }} class="calendar-nav">
                    <ChevronLeft size={16} />
                  </button>
                  <span class="calendar-month">
                    {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
                  </span>
                  <button onclick={(e) => { e.stopPropagation(); goToNextMonth(); }} class="calendar-nav">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div class="calendar-weekdays">
                  {#each dayNames as day}
                    <div class="calendar-weekday">{day}</div>
                  {/each}
                </div>
                
                <div class="calendar-days">
                  {#each calendarDays as day}
                    <div 
                      class="calendar-day {!day.isCurrentMonth ? 'other-month' : ''} {day.isToday ? 'today' : ''} {day.isSelected ? 'selected' : ''}"
                      onclick={(e) => { e.stopPropagation(); selectDate(day.date); }}
                    >
                      {day.day}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
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
            {#if !canEdit && !isHeadmaster && !isToday() && selectedClass}
              <span class="readonly-badge">Read Only</span>
            {/if}
          </div>
          <div class="quick-actions">
            {#each statusOptions as s}
              <button 
                onclick={() => setAll(s)} 
                class="quick-action-btn"
                disabled={!canEdit && !isHeadmaster && !isToday()}
              >
                {#if s === 'PRESENT'}
                  <Check size={12} />
                {:else if s === 'ABSENT'}
                  <X size={12} />
                {:else if s === 'LATE'}
                  <Clock size={12} />
                {:else}
                  <AlertCircle size={12} />
                {/if}
                {statusLabels[s]}
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
                <th>Admission No</th>
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
                  <td class="admission-no">{student.admissionNo}</td>
                  <td class="status-buttons">
                    <div class="status-btn-group">
                      {#each statusOptions as s}
                        {@const Icon = statusIcon[s]}
                        <button
                          onclick={() => updateStudentStatus(student, s)}
                          class="status-btn {student.status === s ? 'active' : ''} {s.toLowerCase()}"
                          title={statusLabels[s]}
                          disabled={!student.canEdit && !isHeadmaster}
                        >
                          <Icon size={14} />
                        </button>
                      {/each}
                    </div>
                    {#if student.note}
                      <div class="status-note" title={student.note}>
                        <AlertCircle size={10} />
                      </div>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <div class="card-footer">
          <button 
            onclick={saveAttendance} 
            disabled={saving || (!canEdit && !isHeadmaster && !isToday())} 
            class="save-btn"
          >
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

  .page-header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
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

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .role-badge.headmaster {
    background: #fef3c7;
    color: #92400e;
  }

  .role-badge.readonly {
    background: #fef2f2;
    color: #991b1b;
  }

  .role-badge.editable {
    background: #ecfdf5;
    color: #065f46;
  }

  .readonly-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.375rem;
    background: #f1f5f9;
    color: #64748b;
    border-radius: 0.25rem;
    font-size: 0.65rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  .admission-no {
    font-family: monospace;
    font-size: 0.75rem;
    color: #64748b;
  }

  .status-note {
    position: absolute;
    bottom: 2px;
    right: 2px;
    color: #94a3b8;
  }

  .status-buttons {
    position: relative;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:disabled:hover {
    transform: none;
  }

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

  .custom-dropdown {
    position: relative;
    width: 100%;
  }

  .dropdown-trigger {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    transition: all 0.15s ease;
  }

  .dropdown-trigger:hover {
    border-color: #94a3b8;
  }

  .custom-dropdown.open .dropdown-trigger {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

  .calendar-container {
    position: relative;
    width: 100%;
  }

  .calendar-trigger {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.15s ease;
  }

  .calendar-trigger:hover {
    border-color: #94a3b8;
  }

  .calendar-value {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .calendar-icon {
    flex-shrink: 0;
    color: #94a3b8;
    transition: transform 0.15s ease;
  }

  .calendar-dropdown {
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
    padding: 0.75rem;
    min-width: 280px;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .calendar-nav {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: background 0.15s ease;
  }

  .calendar-nav:hover {
    background: #f1f5f9;
  }

  .calendar-month {
    font-size: 0.875rem;
    font-weight: 600;
    color: #0f172a;
  }

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .calendar-weekday {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    padding: 0.25rem;
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
  }

  .calendar-day {
    text-align: center;
    padding: 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 0.15s ease;
  }

  .calendar-day:hover {
    background: #f1f5f9;
  }

  .calendar-day.other-month {
    color: #cbd5e1;
  }

  .calendar-day.today {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }

  .calendar-day.selected {
    background: #2563eb;
    color: white;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: #64748b;
  }

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

  .spinning {
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

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

    .calendar-dropdown {
      left: auto;
      right: 0;
      min-width: 260px;
    }
  }

  /* Dark Mode */
  :global(.dark) .attendance-container {
    background: #0f172a;
  }

  :global(.dark) .page-title {
    color: #f8fafc;
  }

  :global(.dark) .page-subtitle {
    color: #94a3b8;
  }

  :global(.dark) .title-icon {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  :global(.dark) .role-badge.headmaster {
    background: #78350f;
    color: #fde68a;
  }

  :global(.dark) .role-badge.readonly {
    background: #7f1d1d;
    color: #fecaca;
  }

  :global(.dark) .role-badge.editable {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .readonly-badge {
    background: #334155;
    color: #94a3b8;
  }

  :global(.dark) .admission-no {
    color: #94a3b8;
  }

  :global(.dark) .filters-card,
  :global(.dark) .attendance-card,
  :global(.dark) .summary-card,
  :global(.dark) .empty-state {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .filter-label {
    color: #94a3b8;
  }

  :global(.dark) .dropdown-trigger,
  :global(.dark) .calendar-trigger {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .dropdown-trigger:hover,
  :global(.dark) .calendar-trigger:hover {
    border-color: #64748b;
  }

  :global(.dark) .dropdown-menu,
  :global(.dark) .calendar-dropdown {
    background: #1e293b;
    border-color: #475569;
  }

  :global(.dark) .dropdown-search {
    border-bottom-color: #475569;
  }

  :global(.dark) .dropdown-search input {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .dropdown-option {
    color: #cbd5e1;
  }

  :global(.dark) .dropdown-option:hover {
    background: #334155;
  }

  :global(.dark) .dropdown-option.selected {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .calendar-nav:hover {
    background: #334155;
  }

  :global(.dark) .calendar-month {
    color: #f8fafc;
  }

  :global(.dark) .calendar-weekday {
    color: #94a3b8;
  }

  :global(.dark) .calendar-day {
    color: #cbd5e1;
  }

  :global(.dark) .calendar-day:hover {
    background: #334155;
  }

  :global(.dark) .calendar-day.other-month {
    color: #64748b;
  }

  :global(.dark) .calendar-day.today {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .calendar-day.selected {
    background: #2563eb;
    color: white;
  }

  :global(.dark) .summary-value {
    color: #f8fafc;
  }

  :global(.dark) .summary-label {
    color: #94a3b8;
  }

  :global(.dark) .attendance-table thead {
    background: #0f172a;
    border-bottom-color: #334155;
  }

  :global(.dark) .attendance-table th {
    color: #94a3b8;
  }

  :global(.dark) .attendance-table td {
    border-bottom-color: #334155;
  }

  :global(.dark) .student-row:hover td {
    background: #0f172a;
  }

  :global(.dark) .student-name-cell {
    color: #f8fafc;
  }

  :global(.dark) .student-avatar {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .status-btn {
    background: #1e293b;
    border-color: #475569;
  }

  :global(.dark) .status-btn:not(.active) {
    color: #64748b;
  }

  :global(.dark) .status-btn:not(.active):hover {
    background: #334155;
  }

  :global(.dark) .quick-action-btn {
    background: #334155;
    color: #cbd5e1;
  }

  :global(.dark) .quick-action-btn:hover {
    background: #475569;
  }

  :global(.dark) .empty-icon {
    color: #475569;
  }

  :global(.dark) .empty-state p {
    color: #94a3b8;
  }

  :global(.dark) .empty-hint {
    color: #64748b;
  }

  :global(.dark) .save-btn {
    background: #3b82f6;
  }

  :global(.dark) .save-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  :global(.dark) .save-btn:disabled {
    background: #475569;
  }
</style>