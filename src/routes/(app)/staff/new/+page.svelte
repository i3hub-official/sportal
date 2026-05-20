<!-- src/routes/(app)/staff/new/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let loading      = $state(false);
  let photoPreview = $state<string | null>(null);

  function onPhotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) photoPreview = URL.createObjectURL(file);
  }

  const v = $derived(form?.values ?? {});
</script>

<svelte:head><title>Add Staff — SMS</title></svelte:head>

<div class="max-w-2xl">
  <div class="page-header">
    <div>
      <h1 class="page-title">Add Staff Member</h1>
      <p class="page-subtitle">Create a new staff account and profile</p>
    </div>
    <a href="/staff" class="btn-secondary">← Back</a>
  </div>

  {#if form?.error}
    <div class="alert-error mb-5 rounded-xl">{form.error}</div>
  {/if}

  <div class="card">
    <div class="card-body">
      <form method="POST" enctype="multipart/form-data"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => { loading = false; update(); };
        }}
        class="space-y-5"
      >
        <!-- Photo -->
        <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div class="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
            {#if photoPreview}
              <img src={photoPreview} alt="Preview" class="w-full h-full object-cover" />
            {:else}
              <span class="text-3xl">👤</span>
            {/if}
          </div>
          <div>
            <label class="label mb-1">Photo <span class="text-slate-400 font-normal">(optional)</span></label>
            <input type="file" name="photo" accept="image/*" onchange={onPhotoChange}
              class="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                     file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium cursor-pointer" />
            <p class="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Max 2MB</p>
          </div>
        </div>

        <!-- Names -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="label">First Name *</label>
            <input id="firstName" name="firstName" required value={v.firstName ?? ''}
              placeholder="Adaeze" class="input" />
          </div>
          <div>
            <label for="lastName" class="label">Last Name *</label>
            <input id="lastName" name="lastName" required value={v.lastName ?? ''}
              placeholder="Okonkwo" class="input" />
          </div>
        </div>

        <div>
          <label for="middleName" class="label">Middle Name <span class="text-slate-400 font-normal">(optional)</span></label>
          <input id="middleName" name="middleName" value={v.middleName ?? ''}
            placeholder="Chisom" class="input" />
        </div>

        <!-- Email & Staff ID -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="email" class="label">Email Address *</label>
            <input id="email" name="email" type="email" required value={v.email ?? ''}
              placeholder="staff@school.edu.ng" class="input" />
          </div>
          <div>
            <label for="staffId" class="label">Staff ID *</label>
            <input id="staffId" name="staffId" required value={v.staffId ?? ''}
              placeholder="TCH-001" class="input" />
          </div>
        </div>

        <!-- Role & Staff Role -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="role" class="label">System Role *</label>
            <select id="role" name="role" class="input">
              <option value="TEACHER"     selected={v.role === 'TEACHER'}>Teacher</option>
              <option value="ADMIN"       selected={v.role === 'ADMIN'}>Admin / Bursar</option>
              <option value="SUPER_ADMIN" selected={v.role === 'SUPER_ADMIN'}>Headmaster</option>
            </select>
          </div>
          <div>
            <label for="staffRole" class="label">Staff Role *</label>
            <select id="staffRole" name="staffRole" required class="input">
              <option value="">Select…</option>
              <option value="HEADMASTER"      selected={v.staffRole === 'HEADMASTER'}>Headmaster</option>
              <option value="DEPUTY_HEAD"     selected={v.staffRole === 'DEPUTY_HEAD'}>Deputy Head</option>
              <option value="CLASS_TEACHER"   selected={v.staffRole === 'CLASS_TEACHER'}>Class Teacher</option>
              <option value="SUBJECT_TEACHER" selected={v.staffRole === 'SUBJECT_TEACHER'}>Subject Teacher</option>
              <option value="BURSAR"          selected={v.staffRole === 'BURSAR'}>Bursar</option>
              <option value="SECRETARY"       selected={v.staffRole === 'SECRETARY'}>Secretary</option>
              <option value="LIBRARIAN"       selected={v.staffRole === 'LIBRARIAN'}>Librarian</option>
              <option value="COUNSELOR"       selected={v.staffRole === 'COUNSELOR'}>Counselor</option>
              <option value="SUPPORT_STAFF"   selected={v.staffRole === 'SUPPORT_STAFF'}>Support Staff</option>
            </select>
          </div>
        </div>

        <!-- Gender -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="gender" class="label">Gender *</label>
            <select id="gender" name="gender" required class="input">
              <option value="">Select…</option>
              <option value="MALE"   selected={v.gender === 'MALE'}>Male</option>
              <option value="FEMALE" selected={v.gender === 'FEMALE'}>Female</option>
            </select>
          </div>
          <div>
            <label for="phone" class="label">Phone Number</label>
            <input id="phone" name="phone" type="tel" value={v.phone ?? ''}
              placeholder="08012345678" class="input" />
          </div>
        </div>

        <!-- Qualification & Address -->
        <div>
          <label for="qualification" class="label">Qualification</label>
          <input id="qualification" name="qualification" value={v.qualification ?? ''}
            placeholder="B.Ed, M.Sc, NCE…" class="input" />
        </div>

        <div>
          <label for="address" class="label">Address</label>
          <textarea id="address" name="address" rows="2"
            placeholder="No. 1, Example Street, Lagos"
            class="input resize-none">{v.address ?? ''}</textarea>
        </div>

        <div class="pt-2 flex gap-3">
          <button type="submit" disabled={loading} class="btn-primary">
            {#if loading}
              <span class="spinner"></span> Creating...
            {:else}
              Create Staff Account
            {/if}
          </button>
          <a href="/staff" class="btn-secondary">Cancel</a>
        </div>

        <p class="text-xs text-slate-400">
          A temporary password will be generated and emailed to the staff member.
        </p>
      </form>
    </div>
  </div>
</div>