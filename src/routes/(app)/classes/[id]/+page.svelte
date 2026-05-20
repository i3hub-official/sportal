<!-- src/routes/(app)/classes/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import { 
    School, Users, BookOpen, UserCheck, Calendar, 
    ArrowLeft, Edit2, Save, X, UserPlus, Mail,
    Phone, MapPin, Award, Clock, TrendingUp
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state(false);
  let loading = $state(false);

  // Safely access class data with fallbacks
  const classData = data?.class;
  const availableTeachers = data?.availableTeachers || [];

  const levelColor: Record<string, string> = {
    NURSERY: 'badge-purple',
    PRIMARY: 'badge-blue',
    SECONDARY: 'badge-green'
  };

  // Helper to get student count safely
  const studentCount = classData?.students?.length || 0;
  const capacity = classData?.capacity || 40;
  const fillPercentage = (studentCount / capacity) * 100;
</script>

<svelte:head>
  <title>{classData?.name || 'Class'} — Class Details</title>
</svelte:head>

<div class="class-detail-container">
  <div class="class-detail-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <School size={24} />
        </div>
        <div>
          <h1 class="page-title">{classData?.name || 'Class Details'}</h1>
          <p class="page-subtitle">
            {classData?.level || 'Level'} · {studentCount} student{studentCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button onclick={() => editing = !editing} class="action-btn edit-btn">
          {#if editing}
            <X size={16} />
            Cancel
          {:else}
            <Edit2 size={16} />
            Edit
          {/if}
        </button>
        <a href="/classes" class="action-btn back-btn">
          <ArrowLeft size={16} />
          Back
        </a>
      </div>
    </div>

    {#if form?.success}
      <div class="success-alert">
        <div class="success-content">
          Class updated successfully!
        </div>
      </div>
    {/if}
    
    {#if form?.error}
      <div class="error-alert">
        <div class="error-content">
          {form.error}
        </div>
      </div>
    {/if}

    <div class="detail-card">
      <div class="card-body">
        {#if !editing}
          <!-- View Mode -->
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <School size={14} />
                Class Name
              </div>
              <div class="info-value">{classData?.name || '—'}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <Award size={14} />
                Level
              </div>
              <div class="info-value">
                <span class="level-badge {levelColor[classData?.level] || 'badge-gray'}">
                  {classData?.level || '—'}
                </span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <UserCheck size={14} />
                Class Teacher
              </div>
              <div class="info-value">
                {#if classData?.classTeacher}
                  {classData.classTeacher.firstName} {classData.classTeacher.lastName}
                {:else}
                  <span class="not-assigned">Not assigned</span>
                {/if}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <Users size={14} />
                Student Capacity
              </div>
              <div class="info-value">{capacity}</div>
            </div>

            <div class="info-item full-width">
              <div class="info-label">
                <Users size={14} />
                Current Enrollment
              </div>
              <div class="info-value">
                {studentCount} / {capacity}
                <div class="capacity-bar">
                  <div 
                    class="capacity-fill" 
                    style="width: {fillPercentage}%"
                  ></div>
                </div>
              </div>
            </div>

            <div class="info-item full-width">
              <div class="info-label">
                <Calendar size={14} />
                Academic Year
              </div>
              <div class="info-value">{classData?.academicYear?.name || '—'}</div>
            </div>
          </div>

          <!-- Students Section -->
          <div class="students-section">
            <div class="section-header">
              <Users size={18} />
              <h3>Students in this Class</h3>
              <span class="student-count">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
            </div>
            
            {#if classData?.students && classData.students.length > 0}
              <div class="students-grid">
                {#each classData.students as student}
                  <a href="/students/{student.id}" class="student-card">
                    <div class="student-avatar">
                      {student.firstName?.charAt(0) || ''}{student.lastName?.charAt(0) || ''}
                    </div>
                    <div class="student-info">
                      <p class="student-name">{student.firstName} {student.lastName}</p>
                      <p class="student-admission">{student.admissionNo || '—'}</p>
                    </div>
                  </a>
                {/each}
              </div>
            {:else}
              <div class="empty-students">
                <Users size={48} />
                <p>No students enrolled in this class yet</p>
                <a href="/students/new" class="add-student-link">
                  <UserPlus size={16} />
                  Enroll Student
                </a>
              </div>
            {/if}
          </div>

          <!-- Timetable Preview -->
          {#if classData?.timetableSlots && classData.timetableSlots.length > 0}
            <div class="timetable-preview">
              <div class="section-header">
                <Clock size={18} />
                <h3>Timetable Preview</h3>
                <a href="/timetable?class={classData.id}" class="view-all-link">View Full Timetable →</a>
              </div>
              <div class="timetable-slots">
                {#each classData.timetableSlots as slot}
                  <div class="slot-item">
                    <span class="slot-day">{slot.dayOfWeek?.slice(0, 3) || '—'}</span>
                    <span class="slot-time">{slot.startTime || '—'} – {slot.endTime || '—'}</span>
                    <span class="slot-subject">{slot.subject?.name || '—'}</span>
                    <span class="slot-teacher">
                      {slot.teacher?.firstName || ''} {slot.teacher?.lastName || ''}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        {:else}
          <!-- Edit Mode -->
          <form method="POST" action="?/update" use:enhance class="edit-form">
            <div class="edit-form-grid">
              <div class="form-field">
                <label class="form-label">Class Name *</label>
                <input 
                  name="name" 
                  required 
                  value={classData?.name || ''} 
                  class="form-input" 
                />
              </div>

              <div class="form-field">
                <label class="form-label">Level *</label>
                <select name="level" required class="form-input">
                  <option value="NURSERY" selected={classData?.level === 'NURSERY'}>Nursery</option>
                  <option value="PRIMARY" selected={classData?.level === 'PRIMARY'}>Primary</option>
                  <option value="SECONDARY" selected={classData?.level === 'SECONDARY'}>Secondary</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Class Teacher</label>
                <select name="classTeacherId" class="form-input">
                  <option value="">— Select teacher —</option>
                  {#each availableTeachers as teacher}
                    <option 
                      value={teacher.id} 
                      selected={teacher.id === classData?.classTeacherId}
                    >
                      {teacher.firstName} {teacher.lastName} ({teacher.staffRole?.replace('_', ' ') || 'Teacher'})
                    </option>
                  {/each}
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Capacity</label>
                <input 
                  name="capacity" 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={capacity} 
                  class="form-input" 
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" disabled={loading} class="save-btn">
                {#if loading}
                  <span class="spinner"></span>
                  Saving...
                {:else}
                  <Save size={16} />
                  Save Changes
                {/if}
              </button>
              <button type="button" onclick={() => editing = false} class="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .class-detail-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .class-detail-wrapper {
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

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    color: #475569;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .edit-btn {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .edit-btn:hover {
    background: #dbeafe;
  }

  /* Alerts */
  .success-alert,
  .error-alert {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .success-alert {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .error-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }

  /* Detail Card */
  .detail-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .card-body {
    padding: 1.5rem;
  }

  /* Info Grid */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item.full-width {
    grid-column: span 2;
  }

  .info-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
  }

  .info-value {
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 500;
  }

  .not-assigned {
    color: #94a3b8;
    font-style: italic;
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .badge-purple {
    background: #f5f3ff;
    color: #5b21b6;
  }

  .badge-blue {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .badge-green {
    background: #ecfdf5;
    color: #065f46;
  }

  .badge-gray {
    background: #f1f5f9;
    color: #475569;
  }

  .capacity-bar {
    margin-top: 0.5rem;
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
  }

  .capacity-fill {
    height: 100%;
    background: #2563eb;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  /* Students Section */
  .students-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #1e293b;
  }

  .student-count {
    margin-left: auto;
    font-size: 0.75rem;
    color: #64748b;
    font-weight: normal;
  }

  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .student-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .student-card:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    transform: translateY(-2px);
  }

  .student-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #dbeafe;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .student-info {
    flex: 1;
  }

  .student-name {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.875rem;
  }

  .student-admission {
    font-size: 0.7rem;
    color: #64748b;
  }

  .empty-students {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .empty-students svg {
    margin-bottom: 0.5rem;
    color: #cbd5e1;
  }

  .add-student-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: background 0.15s ease;
  }

  .add-student-link:hover {
    background: #1d4ed8;
  }

  /* Timetable Preview */
  .timetable-preview {
    margin-bottom: 0;
  }

  .view-all-link {
    margin-left: auto;
    font-size: 0.75rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: normal;
  }

  .view-all-link:hover {
    text-decoration: underline;
  }

  .timetable-slots {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .slot-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }

  .slot-day {
    font-weight: 600;
    color: #2563eb;
    min-width: 50px;
  }

  .slot-time {
    color: #64748b;
    font-family: monospace;
    font-size: 0.75rem;
  }

  .slot-subject {
    flex: 1;
    font-weight: 500;
    color: #0f172a;
  }

  .slot-teacher {
    color: #64748b;
    font-size: 0.75rem;
  }

  /* Edit Form */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .edit-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
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

  .form-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
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

  .save-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .cancel-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cancel-btn:hover {
    background: #f8fafc;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .class-detail-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .info-item.full-width {
      grid-column: span 1;
    }

    .edit-form-grid {
      grid-template-columns: 1fr;
    }

    .students-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .class-detail-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .action-btn {
      background: #1e293b;
      border-color: #334155;
      color: #cbd5e1;
    }

    .action-btn:hover {
      background: #334155;
    }

    .detail-card {
      background: #1e293b;
      border-color: #334155;
    }

    .info-value {
      color: #f8fafc;
    }

    .badge-purple {
      background: #4c1d95;
      color: #c4b5fd;
    }

    .badge-blue {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .badge-green {
      background: #064e3b;
      color: #6ee7b7;
    }

    .student-card {
      background: #0f172a;
      border-color: #334155;
    }

    .student-card:hover {
      background: #1e293b;
    }

    .student-name {
      color: #f8fafc;
    }

    .slot-item {
      background: #0f172a;
    }

    .form-input {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .cancel-btn {
      background: #1e293b;
      border-color: #475569;
      color: #cbd5e1;
    }

    .cancel-btn:hover {
      background: #334155;
    }
  }
</style>