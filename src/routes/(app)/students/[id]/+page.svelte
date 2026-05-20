<!-- src/routes/(app)/students/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { 
    ArrowLeft, Edit2, Save, X, Camera, User, Calendar, 
    MapPin, BookOpen, Users, GraduationCap, FileText, 
    Award, CheckCircle, AlertCircle, Loader2, Upload,
    Mail, Phone, Home, Clock, UserCheck, UserX
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state(false);
  let loading = $state(false);
  let photoPreview = $state<string | null>(null);

  const { student } = data;

  function onPhotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) photoPreview = URL.createObjectURL(file);
  }

  $effect(() => { 
    if (form?.success) editing = false; 
  });

  const dob = $derived(student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—');

  const age = $derived(student.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null);

  const levelColor: Record<string, string> = {
    NURSERY: 'badge-purple', 
    PRIMARY: 'badge-blue', 
    SECONDARY: 'badge-green'
  };
</script>

<svelte:head>
  <title>{student.firstName} {student.lastName} — SMS</title>
</svelte:head>

<div class="student-detail-container">
  <div class="student-detail-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 class="page-title">{student.firstName} {student.lastName}</h1>
          <p class="page-subtitle">
            {student.admissionNo} · {student.class?.name ?? 'No class assigned'}
          </p>
        </div>
      </div>
      <div class="header-actions">
        <a href="/students/{student.id}/results" class="action-btn results-btn">
          <Award size={16} />
          Results
        </a>
        <button onclick={() => editing = !editing} class="action-btn edit-btn">
          {#if editing}
            <X size={16} />
            Cancel
          {:else}
            <Edit2 size={16} />
            Edit
          {/if}
        </button>
        <a href="/students" class="action-btn back-btn">
          <ArrowLeft size={16} />
          Back
        </a>
      </div>
    </div>

    {#if form?.success}
      <div class="success-alert">
        <CheckCircle size={18} />
        Profile updated successfully.
      </div>
    {/if}
    
    {#if form?.error}
      <div class="error-alert">
        <AlertCircle size={18} />
        {form.error}
      </div>
    {/if}

    <div class="profile-card">
      <div class="card-body">
        {#if !editing}
          <!-- View Mode -->
          <div class="profile-view">
            <div class="profile-avatar">
              {#if student.photoUrl}
                <img src={student.photoUrl} alt={student.firstName} class="avatar-image" />
              {:else}
                <div class="avatar-placeholder">
                  <User size={48} />
                </div>
              {/if}
            </div>
            
            <div class="profile-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">
                    <FileText size={12} />
                    Admission No
                  </div>
                  <div class="info-value admission-number">{student.admissionNo}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <BookOpen size={12} />
                    Level
                  </div>
                  <div class="info-value">
                    <span class="level-badge {levelColor[student.level]}">{student.level}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Users size={12} />
                    Class
                  </div>
                  <div class="info-value">{student.class?.name ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <UserCheck size={12} />
                    Gender
                  </div>
                  <div class="info-value">{student.gender ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Calendar size={12} />
                    Date of Birth
                  </div>
                  <div class="info-value">
                    {dob}
                    {#if age}
                      <span class="age-badge">({age} years)</span>
                    {/if}
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <BookOpen size={12} />
                    Religion
                  </div>
                  <div class="info-value">{student.religion ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <MapPin size={12} />
                    State of Origin
                  </div>
                  <div class="info-value">{student.stateOfOrigin ?? '—'}</div>
                </div>
                
                <div class="info-item full-width">
                  <div class="info-label">
                    <Home size={12} />
                    Address
                  </div>
                  <div class="info-value address-value">{student.address ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Edit Mode -->
          <form 
            method="POST" 
            action="?/update" 
            enctype="multipart/form-data"
            use:enhance={() => { 
              loading = true; 
              return async ({ update }) => { 
                loading = false; 
                update(); 
              }; 
            }}
            class="edit-form"
          >
            <div class="photo-upload-section">
              <div class="photo-preview">
                {#if photoPreview}
                  <img src={photoPreview} alt="Preview" class="preview-image" />
                {:else if student.photoUrl}
                  <img src={student.photoUrl} alt={student.firstName} class="preview-image" />
                {:else}
                  <div class="preview-placeholder">
                    <Camera size={32} />
                  </div>
                {/if}
              </div>
              <div class="upload-control">
                <label class="upload-label">
                  <Upload size={14} />
                  Change Photo
                  <input 
                    type="file" 
                    name="photo" 
                    accept="image/*" 
                    onchange={onPhotoChange}
                    class="hidden-input" 
                  />
                </label>
                <p class="upload-hint">JPEG, PNG, GIF up to 2MB</p>
              </div>
            </div>

            <div class="edit-form-grid">
              <div class="form-field">
                <label class="form-label">First Name *</label>
                <input name="firstName" required value={student.firstName} class="form-input" />
              </div>
              
              <div class="form-field">
                <label class="form-label">Last Name *</label>
                <input name="lastName" required value={student.lastName} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">Class</label>
                <select name="classId" class="form-input">
                  <option value="">— Unassigned —</option>
                  {#each data.classes as cls}
                    <option value={cls.id} selected={cls.id === student.classId}>{cls.name}</option>
                  {/each}
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Gender</label>
                <select name="gender" class="form-input">
                  <option value="">Select…</option>
                  <option value="MALE" selected={student.gender === 'MALE'}>Male</option>
                  <option value="FEMALE" selected={student.gender === 'FEMALE'}>Female</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">Religion</label>
                <input name="religion" value={student.religion ?? ''} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">State of Origin</label>
                <input name="stateOfOrigin" value={student.stateOfOrigin ?? ''} class="form-input" />
              </div>

              <div class="form-field full-width">
                <label class="form-label">Address</label>
                <textarea name="address" rows="3" class="form-textarea">{student.address ?? ''}</textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" disabled={loading} class="save-btn">
                {#if loading}
                  <Loader2 size={16} class="spinning" />
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

  .student-detail-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .student-detail-wrapper {
    max-width: 56rem;
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
    flex-wrap: wrap;
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
    transform: translateY(-1px);
  }

  .results-btn {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #065f46;
  }

  .results-btn:hover {
    background: #d1fae5;
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

  /* Profile Card */
  .profile-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .card-body {
    padding: 1.5rem;
  }

  /* View Mode */
  .profile-view {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .profile-avatar {
    flex-shrink: 0;
  }

  .avatar-image {
    width: 8rem;
    height: 8rem;
    border-radius: 1rem;
    object-fit: cover;
    border: 3px solid #e2e8f0;
  }

  .avatar-placeholder {
    width: 8rem;
    height: 8rem;
    border-radius: 1rem;
    background: #f1f5f9;
    border: 2px dashed #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }

  .profile-info {
    flex: 1;
    min-width: 250px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .full-width {
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

  .admission-number {
    font-family: 'SF Mono', 'Monaco', monospace;
    font-size: 0.8125rem;
    color: #2563eb;
  }

  .address-value {
    line-height: 1.5;
  }

  .age-badge {
    font-size: 0.7rem;
    color: #64748b;
    margin-left: 0.5rem;
    font-weight: normal;
  }

  /* Badges */
  .level-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
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

  /* Edit Mode */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .photo-upload-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }

  .photo-preview {
    width: 5rem;
    height: 5rem;
    border-radius: 0.75rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    width: 100%;
    height: 100%;
    background: #f1f5f9;
    border: 2px dashed #cbd5e1;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }

  .upload-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #eff6ff;
    color: #2563eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .upload-label:hover {
    background: #dbeafe;
  }

  .upload-hint {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  .hidden-input {
    display: none;
  }

  .edit-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .full-width {
    grid-column: span 2;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    background: white;
    color: #0f172a;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-textarea {
    font-family: inherit;
    resize: vertical;
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

  .save-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .save-btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    opacity: 0.7;
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
    border-color: #cbd5e1;
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
    .student-detail-container {
      padding: 1rem;
    }

    .card-body {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .full-width {
      grid-column: span 1;
    }

    .profile-view {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .info-label {
      justify-content: center;
    }

    .edit-form-grid {
      grid-template-columns: 1fr;
    }

    .full-width {
      grid-column: span 1;
    }

    .form-actions {
      flex-direction: column;
    }

    .save-btn,
    .cancel-btn {
      width: 100%;
      justify-content: center;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .student-detail-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .page-subtitle {
      color: #94a3b8;
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

    .profile-card {
      background: #1e293b;
      border-color: #334155;
    }

    .avatar-placeholder {
      background: #334155;
      border-color: #475569;
    }

    .avatar-image {
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

    .form-label {
      color: #cbd5e1;
    }

    .form-input,
    .form-textarea {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: #64748b;
    }

    .form-input:focus,
    .form-textarea:focus {
      border-color: #3b82f6;
    }

    .upload-label {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .upload-label:hover {
      background: #2d4a7a;
    }

    .preview-placeholder {
      background: #334155;
      border-color: #475569;
    }

    .cancel-btn {
      background: #1e293b;
      border-color: #475569;
      color: #cbd5e1;
    }

    .cancel-btn:hover {
      background: #334155;
    }

    .photo-upload-section,
    .form-actions {
      border-color: #334155;
    }
  }
</style>