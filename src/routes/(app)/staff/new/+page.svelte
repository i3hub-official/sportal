<!-- src/routes/(app)/staff/new/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { 
    ArrowLeft, UserPlus, Camera, User, Mail, Phone,
    Briefcase, Shield, Users, MapPin, GraduationCap,
    Calendar, CreditCard, AlertCircle, CheckCircle,
    Loader2, Upload, X, Save, Eye, EyeOff,
    Search, ChevronDown, School
  } from 'lucide-svelte';

  let { form }: { form: ActionData } = $props();
  let loading = $state(false);
  let photoPreview = $state<string | null>(null);

      const v = $derived(form?.values ?? {});
      
  // Dropdown states
  let roleDropdownOpen = $state(false);
  let staffRoleDropdownOpen = $state(false);
  let genderDropdownOpen = $state(false);
  
  let roleSearch = $state('');
  let staffRoleSearch = $state('');
  let genderSearch = $state('');

  // Role options
  const roleOptions = [
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'ADMIN', label: 'Admin / Bursar' },
    { value: 'SUPER_ADMIN', label: 'Headmaster' }
  ];

  // Staff role options
  const staffRoleOptions = [
    { value: 'HEADMASTER', label: 'Headmaster' },
    { value: 'DEPUTY_HEAD', label: 'Deputy Head' },
    { value: 'CLASS_TEACHER', label: 'Class Teacher' },
    { value: 'SUBJECT_TEACHER', label: 'Subject Teacher' },
    { value: 'BURSAR', label: 'Bursar' },
    { value: 'SECRETARY', label: 'Secretary' },
    { value: 'LIBRARIAN', label: 'Librarian' },
    { value: 'COUNSELOR', label: 'Counselor' },
    { value: 'SUPPORT_STAFF', label: 'Support Staff' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  // Selected values
  let selectedRole = $state(v.role || '');
  let selectedStaffRole = $state(v.staffRole || '');
  let selectedGender = $state(v.gender || '');

  // Get selected labels
  const selectedRoleLabel = $derived(() => {
    const option = roleOptions.find(r => r.value === selectedRole);
    return option?.label || 'Select role…';
  });

  const selectedStaffRoleLabel = $derived(() => {
    const option = staffRoleOptions.find(r => r.value === selectedStaffRole);
    return option?.label || 'Select staff role…';
  });

  const selectedGenderLabel = $derived(() => {
    const option = genderOptions.find(g => g.value === selectedGender);
    return option?.label || 'Select gender…';
  });

  // Filtered options
  const filteredRoles = $derived(() => {
    if (!roleSearch) return roleOptions;
    return roleOptions.filter(r => 
      r.label.toLowerCase().includes(roleSearch.toLowerCase())
    );
  });

  const filteredStaffRoles = $derived(() => {
    if (!staffRoleSearch) return staffRoleOptions;
    return staffRoleOptions.filter(r => 
      r.label.toLowerCase().includes(staffRoleSearch.toLowerCase())
    );
  });

  const filteredGenders = $derived(() => {
    if (!genderSearch) return genderOptions;
    return genderOptions.filter(g => 
      g.label.toLowerCase().includes(genderSearch.toLowerCase())
    );
  });

  function selectRole(value: string) {
    selectedRole = value;
    roleDropdownOpen = false;
    roleSearch = '';
  }

  function selectStaffRole(value: string) {
    selectedStaffRole = value;
    staffRoleDropdownOpen = false;
    staffRoleSearch = '';
  }

  function selectGender(value: string) {
    selectedGender = value;
    genderDropdownOpen = false;
    genderSearch = '';
  }

  function clearRole() {
    selectedRole = '';
    roleDropdownOpen = false;
    roleSearch = '';
  }

  function clearStaffRole() {
    selectedStaffRole = '';
    staffRoleDropdownOpen = false;
    staffRoleSearch = '';
  }

  function clearGender() {
    selectedGender = '';
    genderDropdownOpen = false;
    genderSearch = '';
  }

  // Close dropdowns when clicking outside
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      roleDropdownOpen = false;
      staffRoleDropdownOpen = false;
      genderDropdownOpen = false;
    }
  }

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
  <title>Add Staff — SMS</title>
</svelte:head>

<div class="add-staff-container" onclick={handleClickOutside}>
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

            <!-- Role Dropdown -->
            <div class="form-field">
              <label class="form-label">
                <Shield size={14} />
                System Role *
              </label>
              <div class="custom-dropdown" class:open={roleDropdownOpen}>
                <input type="hidden" name="role" value={selectedRole} />
                <button 
                  type="button" 
                  class="dropdown-trigger"
                  onclick={(e) => { e.stopPropagation(); roleDropdownOpen = !roleDropdownOpen; }}
                >
                  <span class="dropdown-value">{selectedRoleLabel()}</span>
                  {#if selectedRole}
                    <button 
                      class="dropdown-clear" 
                      onclick={(e) => { e.stopPropagation(); clearRole(); }}
                      aria-label="Clear role"
                    >
                      <X size={14} />
                    </button>
                  {/if}
                  <ChevronDown size={16} class="dropdown-icon" />
                </button>
                {#if roleDropdownOpen}
                  <div class="dropdown-menu">
                    <div class="dropdown-search">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search role..." 
                        bind:value={roleSearch}
                        onclick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div class="dropdown-options">
                      {#each filteredRoles() as opt}
                        <div 
                          class="dropdown-option {selectedRole === opt.value ? 'selected' : ''}"
                          onclick={() => selectRole(opt.value)}
                        >
                          {opt.label}
                        </div>
                      {:else}
                        <div class="dropdown-empty">No roles found</div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Staff Role Dropdown -->
            <div class="form-field">
              <label class="form-label">
                <Briefcase size={14} />
                Staff Role *
              </label>
              <div class="custom-dropdown" class:open={staffRoleDropdownOpen}>
                <input type="hidden" name="staffRole" value={selectedStaffRole} />
                <button 
                  type="button" 
                  class="dropdown-trigger"
                  onclick={(e) => { e.stopPropagation(); staffRoleDropdownOpen = !staffRoleDropdownOpen; }}
                >
                  <span class="dropdown-value">{selectedStaffRoleLabel()}</span>
                  {#if selectedStaffRole}
                    <button 
                      class="dropdown-clear" 
                      onclick={(e) => { e.stopPropagation(); clearStaffRole(); }}
                      aria-label="Clear staff role"
                    >
                      <X size={14} />
                    </button>
                  {/if}
                  <ChevronDown size={16} class="dropdown-icon" />
                </button>
                {#if staffRoleDropdownOpen}
                  <div class="dropdown-menu">
                    <div class="dropdown-search">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search staff role..." 
                        bind:value={staffRoleSearch}
                        onclick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div class="dropdown-options">
                      {#each filteredStaffRoles() as opt}
                        <div 
                          class="dropdown-option {selectedStaffRole === opt.value ? 'selected' : ''}"
                          onclick={() => selectStaffRole(opt.value)}
                        >
                          {opt.label}
                        </div>
                      {:else}
                        <div class="dropdown-empty">No staff roles found</div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Gender Dropdown -->
            <div class="form-field">
              <label class="form-label">
                <Users size={14} />
                Gender *
              </label>
              <div class="custom-dropdown" class:open={genderDropdownOpen}>
                <input type="hidden" name="gender" value={selectedGender} />
                <button 
                  type="button" 
                  class="dropdown-trigger"
                  onclick={(e) => { e.stopPropagation(); genderDropdownOpen = !genderDropdownOpen; }}
                >
                  <span class="dropdown-value">{selectedGenderLabel()}</span>
                  {#if selectedGender}
                    <button 
                      class="dropdown-clear" 
                      onclick={(e) => { e.stopPropagation(); clearGender(); }}
                      aria-label="Clear gender"
                    >
                      <X size={14} />
                    </button>
                  {/if}
                  <ChevronDown size={16} class="dropdown-icon" />
                </button>
                {#if genderDropdownOpen}
                  <div class="dropdown-menu">
                    <div class="dropdown-search">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Search gender..." 
                        bind:value={genderSearch}
                        onclick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div class="dropdown-options">
                      {#each filteredGenders() as opt}
                        <div 
                          class="dropdown-option {selectedGender === opt.value ? 'selected' : ''}"
                          onclick={() => selectGender(opt.value)}
                        >
                          {opt.label}
                        </div>
                      {:else}
                        <div class="dropdown-empty">No genders found</div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
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

  /* Custom Dropdown Styles */
  .custom-dropdown {
    position: relative;
    width: 100%;
  }

  .dropdown-trigger {
    width: 100%;
    padding: 0.625rem 0.875rem;
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
    max-height: 200px;
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
  :global(.dark) .add-staff-container {
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

  :global(.dark) .form-card {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .photo-placeholder {
    background: #334155;
    border-color: #475569;
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
  }

  :global(.dark) .dropdown-trigger {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .dropdown-menu {
    background: #1e293b;
    border-color: #475569;
  }

  :global(.dark) .dropdown-search {
    border-bottom-color: #475569;
  }

  :global(.dark) .dropdown-search input {
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

  :global(.dark) .info-note {
    background: #78350f;
    border-color: #92400e;
    color: #fde68a;
  }
</style>