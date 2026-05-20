<!-- src/routes/(app)/staff/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing      = $state(false);
  let loading      = $state(false);
  let photoPreview = $state<string | null>(null);

  const { staff } = data;

  function onPhotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) photoPreview = URL.createObjectURL(file);
  }

  $effect(() => {
    if (form?.success) editing = false;
  });
</script>

<svelte:head><title>{staff.firstName} {staff.lastName} — SMS</title></svelte:head>

<div class="max-w-2xl">
  <div class="page-header">
    <div>
      <h1 class="page-title">{staff.firstName} {staff.lastName}</h1>
      <p class="page-subtitle">{staff.position ?? 'Staff'} · {staff.employeeId}</p>
    </div>
    <div class="flex gap-2">
      <button onclick={() => editing = !editing} class="btn-secondary">
        {editing ? 'Cancel' : '✏️ Edit'}
      </button>
      <a href="/staff" class="btn-ghost">← Back</a>
    </div>
  </div>

  {#if form?.success}
    <div class="alert-success mb-4 rounded-xl">✅ Profile updated successfully.</div>
  {/if}
  {#if form?.error}
    <div class="alert-error mb-4 rounded-xl">{form.error}</div>
  {/if}

  <div class="card">
    <div class="card-body">
      {#if !editing}
        <!-- View mode -->
        <div class="flex items-start gap-5">
          <div class="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-3xl">
            {#if staff.photoUrl}
              <img src={staff.photoUrl} alt={staff.firstName} class="w-full h-full object-cover" />
            {:else}
              👤
            {/if}
          </div>
          <div class="flex-1 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Email</p><p>{staff.user.email}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Employee ID</p><p class="font-mono">{staff.employeeId}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Department</p><p>{staff.department ?? '—'}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Position</p><p>{staff.position ?? '—'}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Phone</p><p>{staff.phone ?? '—'}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Gender</p><p>{staff.gender ?? '—'}</p></div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Role</p>
              <span class="badge-blue">{staff.user.role.replace('_', ' ')}</span>
            </div>
            <div><p class="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Status</p>
              <span class="{staff.user.isActive ? 'badge-green' : 'badge-red'}">
                {staff.user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

      {:else}
        <!-- Edit mode -->
        <form method="POST" action="?/update" enctype="multipart/form-data"
          use:enhance={() => {
            loading = true;
            return async ({ update }) => { loading = false; update(); };
          }}
          class="space-y-5"
        >
          <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div class="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-3xl">
              {#if photoPreview}
                <img src={photoPreview} alt="Preview" class="w-full h-full object-cover" />
              {:else if staff.photoUrl}
                <img src={staff.photoUrl} alt={staff.firstName} class="w-full h-full object-cover" />
              {:else}
                👤
              {/if}
            </div>
            <input type="file" name="photo" accept="image/*" onchange={onPhotoChange}
              class="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium cursor-pointer" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">First Name *</label>
              <input name="firstName" required value={staff.firstName} class="input" />
            </div>
            <div>
              <label class="label">Last Name *</label>
              <input name="lastName" required value={staff.lastName} class="input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Position</label>
              <input name="position" value={staff.position ?? ''} class="input" />
            </div>
            <div>
              <label class="label">Department</label>
              <input name="department" value={staff.department ?? ''} class="input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Phone</label>
              <input name="phone" type="tel" value={staff.phone ?? ''} class="input" />
            </div>
            <div>
              <label class="label">Gender</label>
              <select name="gender" class="input">
                <option value="">Select…</option>
                <option value="Male"   selected={staff.gender === 'Male'}>Male</option>
                <option value="Female" selected={staff.gender === 'Female'}>Female</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" disabled={loading} class="btn-primary">
              {#if loading}<span class="spinner"></span> Saving...{:else}Save Changes{/if}
            </button>
            <button type="button" onclick={() => editing = false} class="btn-secondary">Cancel</button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
