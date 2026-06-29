<!-- src/routes/(app)/staff/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { 
    ArrowLeft, Edit2, Save, X, Camera, User, Mail, Phone,
    Briefcase, Building2, Shield, Users, MapPin, Calendar,
    CreditCard, CheckCircle, AlertCircle, Loader2, Upload,
    UserCheck, UserX, Award, BadgeCheck, Clock
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state(false);
  let loading = $state(false);
  let photoPreview = $state<string | null>(null);

  const { staff } = data;

  function onPhotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) photoPreview = URL.createObjectURL(file);
  }

  $effect(() => {
    if (form?.success) editing = false;
  });

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'badge-purple',
    ADMIN: 'badge-blue',
    TEACHER: 'badge-green',
  };
</script>

<svelte:head>
  <title>{staff.firstName} {staff.lastName} — LSAI</title>
</svelte:head>

<div class="staff-detail-container">
  <div class="staff-detail-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <Users size={24} />
        </div>
        <div>
          <h1 class="page-title">{staff.firstName} {staff.lastName}</h1>
          <p class="page-subtitle">{staff.position ?? 'Staff'} · {staff.employeeId}</p>
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
        <a href="/staff" class="action-btn back-btn">
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
              {#if staff.photoUrl}
                <img src={staff.photoUrl} alt={staff.firstName} class="avatar-image" />
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
                    <Mail size={12} />
                    Email
                  </div>
                  <div class="info-value">{staff.user.email}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <CreditCard size={12} />
                    Employee ID
                  </div>
                  <div class="info-value employee-id">{staff.employeeId}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Building2 size={12} />
                    Department
                  </div>
                  <div class="info-value">{staff.department ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Briefcase size={12} />
                    Position
                  </div>
                  <div class="info-value">{staff.position ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Phone size={12} />
                    Phone
                  </div>
                  <div class="info-value">{staff.phone ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Users size={12} />
                    Gender
                  </div>
                  <div class="info-value">{staff.gender ?? '—'}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <Shield size={12} />
                    System Role
                  </div>
                  <div class="info-value">
                    <span class="role-badge {roleColor[staff.user.role] ?? 'badge-gray'}">
                      {staff.user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">
                    <UserCheck size={12} />
                    Status
                  </div>
                  <div class="info-value">
                    <span class="status-badge {staff.user.isActive ? 'status-active' : 'status-inactive'}">
                      {staff.user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Subjects taught (if teacher) -->
          {#if staff.user.role === 'TEACHER' && staff.subjects?.length > 0}
            <div class="subjects-section">
              <div class="subjects-header">
                <Award size={16} />
                <h3>Subjects Taught</h3>
              </div>
              <div class="subjects-list">
                {#each staff.subjects as subject}
                  <span class="subject-tag">
                    {subject.name}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
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
                {:else if staff.photoUrl}
                  <img src={staff.photoUrl} alt={staff.firstName} class="preview-image" />
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
                <input name="firstName" required value={staff.firstName} class="form-input" />
              </div>
              
              <div class="form-field">
                <label class="form-label">Last Name *</label>
                <input name="lastName" required value={staff.lastName} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">Position</label>
                <input name="position" value={staff.position ?? ''} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">Department</label>
                <input name="department" value={staff.department ?? ''} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">Phone</label>
                <input name="phone" type="tel" value={staff.phone ?? ''} class="form-input" />
              </div>

              <div class="form-field">
                <label class="form-label">Gender</label>
                <select name="gender" class="form-input">
                  <option value="">Select…</option>
                  <option value="MALE" selected={staff.gender === 'MALE'}>Male</option>
                  <option value="FEMALE" selected={staff.gender === 'FEMALE'}>Female</option>
                </select>
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

  .staff-detail-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .staff-detail-wrapper {
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
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

  .employee-id {
    font-family: monospace;
    font-size: 0.8125rem;
    color: #2563eb;
  }

  /* Badges */
  .role-badge {
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

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .status-active {
    background: #ecfdf5;
    color: #065f46;
  }

  .status-inactive {
    background: #fef2f2;
    color: #991b1b;
  }

  /* Subjects Section */
  .subjects-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .subjects-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #1e293b;
  }

  .subjects-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .subject-tag {
    padding: 0.375rem 0.75rem;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
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
    background: white;
    color: #0f172a;
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
    .staff-detail-container {
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
  :global(.dark) .staff-detail-container {
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

  :global(.dark) .action-btn {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }

  :global(.dark) .action-btn:hover {
    background: #334155;
  }

  :global(.dark) .edit-btn {
    background: #1e2d4a;
    border-color: #2d4a7a;
    color: #93c5fd;
  }

  :global(.dark) .edit-btn:hover {
    background: #2d4a7a;
  }

  :global(.dark) .success-alert {
    background: #064e3b;
    border-color: #065f46;
  }

  :global(.dark) .success-alert {
    color: #6ee7b7;
  }

  :global(.dark) .error-alert {
    background: #7f1d1d;
    border-color: #991b1b;
    color: #fecaca;
  }

  :global(.dark) .profile-card {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .avatar-placeholder {
    background: #334155;
    border-color: #475569;
    color: #64748b;
  }

  :global(.dark) .avatar-image {
    border-color: #334155;
  }

  :global(.dark) .info-value {
    color: #f8fafc;
  }

  :global(.dark) .info-label {
    color: #64748b;
  }

  :global(.dark) .badge-purple {
    background: #4c1d95;
    color: #c4b5fd;
  }

  :global(.dark) .badge-blue {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .badge-green {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .badge-gray {
    background: #334155;
    color: #cbd5e1;
  }

  :global(.dark) .status-active {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .status-inactive {
    background: #7f1d1d;
    color: #fecaca;
  }

  :global(.dark) .subjects-section {
    border-top-color: #334155;
  }

  :global(.dark) .subjects-header {
    color: #f8fafc;
  }

  :global(.dark) .subject-tag {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .form-label {
    color: #94a3b8;
  }

  :global(.dark) .form-input {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .form-input::placeholder {
    color: #64748b;
  }

  :global(.dark) .form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  :global(.dark) .upload-label {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .upload-label:hover {
    background: #2d4a7a;
  }

  :global(.dark) .preview-placeholder {
    background: #334155;
    border-color: #475569;
    color: #64748b;
  }

  :global(.dark) .cancel-btn {
    background: #1e293b;
    border-color: #475569;
    color: #cbd5e1;
  }

  :global(.dark) .cancel-btn:hover {
    background: #334155;
  }

  :global(.dark) .photo-upload-section,
  :global(.dark) .form-actions {
    border-top-color: #334155;
    border-bottom-color: #334155;
  }

  :global(.dark) .employee-id {
    color: #60a5fa;
  }
</style>