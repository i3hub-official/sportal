<!-- src/routes/(app)/staff/new/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { 
    ArrowLeft, UserPlus, Camera, User, Mail, Phone,
    Briefcase, Shield, Users, MapPin, GraduationCap,
    Calendar, CreditCard, AlertCircle, CheckCircle,
    Loader2, Upload, X, Save, Eye, EyeOff
  } from 'lucide-svelte';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
  let photoPreview = $state<string | null>(null);

  function onPhotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      photoPreview = URL.createObjectURL(file);
    }
  }

  function clearPhoto() {
    photoPreview = null;
    const fileInput = document.querySelector('input[name="photo"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const v = $derived(form?.values ?? {});
</script>

<svelte:head>
  <title>Add Staff — SMS</title>
</svelte:head>

<div class="add-staff-container">
  <div class="add-staff-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 class="page-title">Add Staff Member</h1>
          <p class="page-subtitle">Create a new staff account and profile</p>
        </div>
      </div>
      <a href="/staff" class="back-btn">
        <ArrowLeft size={16} />
        Back
      </a>
    </div>

    {#if form?.error}
      <div class="error-alert">
        <AlertCircle size={16} />
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="success-alert">
        <CheckCircle size={16} />
        Staff account created successfully!
      </div>
    {/if}

    <div class="form-card">
      <div class="form-body">
        <form 
          method="POST" 
          enctype="multipart/form-data"
          use:enhance={() => {
            loading = true;
            return async ({ update }) => { 
              loading = false; 
              update(); 
            };
          }}
          class="staff-form"
        >
          <!-- Photo Section -->
          <div class="photo-section">
            <div class="photo-preview">
              {#if photoPreview}
                <img src={photoPreview} alt="Preview" class="preview-image" />
                <button type="button" onclick={clearPhoto} class="remove-photo" aria-label="Remove photo">
                  <X size={14} />
                </button>
              {:else}
                <div class="photo-placeholder">
                  <Camera size={32} />
                </div>
              {/if}
            </div>
            <div class="photo-upload">
              <label class="upload-label">
                <Upload size={14} />
                Upload Photo
                <input 
                  type="file" 
                  name="photo" 
                  accept="image/*" 
                  onchange={onPhotoChange}
                  class="hidden-input" 
                />
              </label>
              <p class="photo-hint">JPG, PNG, WebP · Max 2MB</p>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="form-grid">
            <div class="form-field">
              <label for="firstName" class="form-label">
                <User size={14} />
                First Name *
              </label>
              <input 
                id="firstName" 
                name="firstName" 
                required 
                value={v.firstName ?? ''}
                placeholder="Adaeze" 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="lastName" class="form-label">
                <User size={14} />
                Last Name *
              </label>
              <input 
                id="lastName" 
                name="lastName" 
                required 
                value={v.lastName ?? ''}
                placeholder="Okonkwo" 
                class="form-input" 
              />
            </div>

            <div class="form-field full-width">
              <label for="middleName" class="form-label">
                <User size={14} />
                Middle Name
                <span class="optional-badge">Optional</span>
              </label>
              <input 
                id="middleName" 
                name="middleName" 
                value={v.middleName ?? ''}
                placeholder="Chisom" 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="email" class="form-label">
                <Mail size={14} />
                Email Address *
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={v.email ?? ''}
                placeholder="staff@school.edu.ng" 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="staffId" class="form-label">
                <CreditCard size={14} />
                Staff ID *
              </label>
              <input 
                id="staffId" 
                name="staffId" 
                required 
                value={v.staffId ?? ''}
                placeholder="TCH-001" 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="role" class="form-label">
                <Shield size={14} />
                System Role *
              </label>
              <select id="role" name="role" class="form-input">
                <option value="TEACHER" selected={v.role === 'TEACHER'}>Teacher</option>
                <option value="ADMIN" selected={v.role === 'ADMIN'}>Admin / Bursar</option>
                <option value="SUPER_ADMIN" selected={v.role === 'SUPER_ADMIN'}>Headmaster</option>
              </select>
            </div>

            <div class="form-field">
              <label for="staffRole" class="form-label">
                <Briefcase size={14} />
                Staff Role *
              </label>
              <select id="staffRole" name="staffRole" required class="form-input">
                <option value="">Select…</option>
                <option value="HEADMASTER" selected={v.staffRole === 'HEADMASTER'}>Headmaster</option>
                <option value="DEPUTY_HEAD" selected={v.staffRole === 'DEPUTY_HEAD'}>Deputy Head</option>
                <option value="CLASS_TEACHER" selected={v.staffRole === 'CLASS_TEACHER'}>Class Teacher</option>
                <option value="SUBJECT_TEACHER" selected={v.staffRole === 'SUBJECT_TEACHER'}>Subject Teacher</option>
                <option value="BURSAR" selected={v.staffRole === 'BURSAR'}>Bursar</option>
                <option value="SECRETARY" selected={v.staffRole === 'SECRETARY'}>Secretary</option>
                <option value="LIBRARIAN" selected={v.staffRole === 'LIBRARIAN'}>Librarian</option>
                <option value="COUNSELOR" selected={v.staffRole === 'COUNSELOR'}>Counselor</option>
                <option value="SUPPORT_STAFF" selected={v.staffRole === 'SUPPORT_STAFF'}>Support Staff</option>
              </select>
            </div>

            <div class="form-field">
              <label for="gender" class="form-label">
                <Users size={14} />
                Gender *
              </label>
              <select id="gender" name="gender" required class="form-input">
                <option value="">Select…</option>
                <option value="MALE" selected={v.gender === 'MALE'}>Male</option>
                <option value="FEMALE" selected={v.gender === 'FEMALE'}>Female</option>
              </select>
            </div>

            <div class="form-field">
              <label for="phone" class="form-label">
                <Phone size={14} />
                Phone Number
              </label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={v.phone ?? ''}
                placeholder="08012345678" 
                class="form-input" 
              />
            </div>

            <div class="form-field full-width">
              <label for="qualification" class="form-label">
                <GraduationCap size={14} />
                Qualification
              </label>
              <input 
                id="qualification" 
                name="qualification" 
                value={v.qualification ?? ''}
                placeholder="B.Ed, M.Sc, NCE…" 
                class="form-input" 
              />
            </div>

            <div class="form-field full-width">
              <label for="address" class="form-label">
                <MapPin size={14} />
                Address
              </label>
              <textarea 
                id="address" 
                name="address" 
                rows="3"
                placeholder="No. 1, Example Street, Lagos"
                class="form-textarea"
              >{v.address ?? ''}</textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="submit" disabled={loading} class="submit-btn">
              {#if loading}
                <Loader2 size={16} class="spinning" />
                Creating...
              {:else}
                <Save size={16} />
                Create Staff Account
              {/if}
            </button>
            <a href="/staff" class="cancel-btn">Cancel</a>
          </div>

          <div class="info-note">
            <AlertCircle size={14} />
            A temporary password will be generated and emailed to the staff member.
          </div>
        </form>
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

  .add-staff-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .add-staff-wrapper {
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

  .back-btn {
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
    transition: all 0.15s ease;
  }

  .back-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateX(-2px);
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

  /* Form Card */
  .form-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .form-body {
    padding: 1.5rem;
  }

  /* Photo Section */
  .photo-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }

  .photo-preview {
    position: relative;
    width: 5rem;
    height: 5rem;
    border-radius: 0.75rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .photo-placeholder {
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

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-photo {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 1.5rem;
    height: 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .remove-photo:hover {
    background: #dc2626;
    transform: scale(1.05);
  }

  .photo-upload {
    flex: 1;
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

  .hidden-input {
    display: none;
  }

  .photo-hint {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  /* Form Grid */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
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
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .optional-badge {
    font-size: 0.6rem;
    font-weight: 400;
    color: #94a3b8;
    margin-left: 0.25rem;
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

  /* Form Actions */
  .form-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
    margin-bottom: 1rem;
  }

  .submit-btn {
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

  .submit-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
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
    text-decoration: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .cancel-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .info-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    color: #92400e;
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
    .add-staff-container {
      padding: 1rem;
    }

    .form-body {
      padding: 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 0.875rem;
    }

    .full-width {
      grid-column: span 1;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .photo-section {
      flex-direction: column;
      text-align: center;
    }

    .form-actions {
      flex-direction: column;
    }

    .submit-btn,
    .cancel-btn {
      width: 100%;
      justify-content: center;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .add-staff-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .back-btn {
      background: #1e293b;
      border-color: #334155;
      color: #cbd5e1;
    }

    .back-btn:hover {
      background: #334155;
    }

    .form-card {
      background: #1e293b;
      border-color: #334155;
    }

    .photo-placeholder {
      background: #334155;
      border-color: #475569;
    }

    .upload-label {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .upload-label:hover {
      background: #2d4a7a;
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

    .cancel-btn {
      background: #1e293b;
      border-color: #475569;
      color: #cbd5e1;
    }

    .cancel-btn:hover {
      background: #334155;
    }

    .photo-section {
      border-bottom-color: #334155;
    }

    .form-actions {
      border-top-color: #334155;
    }

    .info-note {
      background: #78350f;
      border-color: #92400e;
      color: #fde68a;
    }
  }
</style>