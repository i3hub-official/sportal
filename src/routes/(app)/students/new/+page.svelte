<!-- src/routes/(app)/students/new/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import { 
    ArrowLeft, UserPlus, Camera, User, Mail, Calendar, 
    MapPin, BookOpen, Users, CheckCircle, AlertCircle,
    Loader2, Upload, X, Save
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let photoPreview = $state<string | null>(null);

  const v = $derived(form?.values ?? {});

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
</script>

<svelte:head>
  <title>Enrol Student — LSAI</title>
</svelte:head>

<div class="enrol-container">
  <div class="enrol-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 class="page-title">Enrol Student</h1>
          <p class="page-subtitle">Register a new student into the system</p>
        </div>
      </div>
      <a href="/students" class="back-btn">
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
        <CheckCircle size={20} />
        Student enrolled successfully!
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
          class="student-form"
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
              <p class="photo-hint">Optional. Max 2MB</p>
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
                placeholder="Chidera" 
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
                placeholder="Okafor" 
                class="form-input" 
              />
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
              <label for="dateOfBirth" class="form-label">
                <Calendar size={14} />
                Date of Birth *
              </label>
              <input 
                id="dateOfBirth" 
                name="dateOfBirth" 
                type="date" 
                required 
                value={v.dateOfBirth ?? ''} 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="level" class="form-label">
                <BookOpen size={14} />
                School Level *
              </label>
              <select id="level" name="level" required class="form-input">
                <option value="">Select…</option>
                <option value="NURSERY" selected={v.level === 'NURSERY'}>Nursery</option>
                <option value="PRIMARY" selected={v.level === 'PRIMARY'}>Primary</option>
                <option value="SECONDARY" selected={v.level === 'SECONDARY'}>Secondary</option>
              </select>
            </div>

            <div class="form-field">
              <label for="classId" class="form-label">
                <Users size={14} />
                Class
              </label>
              <select id="classId" name="classId" class="form-input">
                <option value="">— Assign later —</option>
                {#each data.classes as cls}
                  <option value={cls.id} selected={v.classId === cls.id}>{cls.name}</option>
                {/each}
              </select>
            </div>

            <div class="form-field">
              <label for="religion" class="form-label">
                <BookOpen size={14} />
                Religion
              </label>
              <input 
                id="religion" 
                name="religion" 
                value={v.religion ?? ''} 
                placeholder="Christianity / Islam…" 
                class="form-input" 
              />
            </div>

            <div class="form-field">
              <label for="stateOfOrigin" class="form-label">
                <MapPin size={14} />
                State of Origin
              </label>
              <input 
                id="stateOfOrigin" 
                name="stateOfOrigin" 
                value={v.stateOfOrigin ?? ''} 
                placeholder="Lagos" 
                class="form-input" 
              />
            </div>

            <div class="form-field full-width">
              <label for="address" class="form-label">
                <MapPin size={14} />
                Home Address
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
                Enrolling...
              {:else}
                <Save size={16} />
                Enrol Student
              {/if}
            </button>
            <a href="/students" class="cancel-btn">Cancel</a>
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

  .enrol-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .enrol-wrapper {
    max-width: 48rem;
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
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    overflow: hidden;
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
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    margin-bottom: 0.5rem;
  }

  .form-label :global(svg) {
    color: #64748b;
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

  .form-textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    background: white;
    color: #0f172a;
    font-family: inherit;
    resize: vertical;
  }

  .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
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
    .enrol-container {
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
  :global(.dark) .enrol-container {
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

  :global(.dark) .back-btn {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }

  :global(.dark) .back-btn:hover {
    background: #334155;
  }

  :global(.dark) .error-alert {
    background: #7f1d1d;
    border-color: #991b1b;
    color: #fecaca;
  }

  :global(.dark) .success-alert {
    background: #064e3b;
    border-color: #065f46;
    color: #6ee7b7;
  }

  :global(.dark) .form-card {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .photo-placeholder {
    background: #334155;
    border-color: #475569;
    color: #64748b;
  }

  :global(.dark) .upload-label {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .upload-label:hover {
    background: #2d4a7a;
  }

  :global(.dark) .form-label {
    color: #cbd5e1;
  }

  :global(.dark) .form-label :global(svg) {
    color: #94a3b8;
  }

  :global(.dark) .form-input,
  :global(.dark) .form-textarea {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .form-input::placeholder,
  :global(.dark) .form-textarea::placeholder {
    color: #64748b;
  }

  :global(.dark) .form-input:focus,
  :global(.dark) .form-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  :global(.dark) .cancel-btn {
    background: #1e293b;
    border-color: #475569;
    color: #cbd5e1;
  }

  :global(.dark) .cancel-btn:hover {
    background: #334155;
  }

  :global(.dark) .photo-section {
    border-bottom-color: #334155;
  }

  :global(.dark) .form-actions {
    border-top-color: #334155;
  }

  :global(.dark) .submit-btn:disabled {
    background: #475569;
  }
</style>