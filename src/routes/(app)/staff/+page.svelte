<!-- src/routes/(app)/staff/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let search = $state(data.search ?? '');
  let searchTimeout: ReturnType<typeof setTimeout>;

  function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const params = new URLSearchParams($page.url.searchParams);
      params.set('search', search);
      params.set('page', '1');
      goto(`?${params}`, { keepFocus: true });
    }, 350);
  }

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'badge-purple',
    ADMIN:       'badge-blue',
    TEACHER:     'badge-green',
  };
</script>

<svelte:head><title>Staff — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div>
      <h1 class="page-title">Staff</h1>
      <p class="page-subtitle">{data.total} member{data.total !== 1 ? 's' : ''} total</p>
    </div>
    <a href="/staff/new" class="btn-primary">+ Add Staff</a>
  </div>

  <!-- Search -->
  <div class="card mb-5">
    <div class="card-body">
      <input
        type="search"
        bind:value={search}
        oninput={onSearchInput}
        placeholder="Search by name, ID, position or email…"
        class="input max-w-sm"
      />
    </div>
  </div>

  <!-- Table -->
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Employee ID</th>
          <th>Position</th>
          <th>Department</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.staff as member}
          <tr>
            <td>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 uppercase">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
                <span class="font-medium text-slate-800">{member.firstName} {member.lastName}</span>
              </div>
            </td>
            <td class="font-mono text-xs">{member.employeeId}</td>
            <td>{member.position ?? '—'}</td>
            <td>{member.department ?? '—'}</td>
            <td class="text-slate-500">{member.user.email}</td>
            <td><span class="{roleColor[member.user.role] ?? 'badge-gray'}">{member.user.role.replace('_', ' ')}</span></td>
            <td>
              <span class="{member.user.isActive ? 'badge-green' : 'badge-red'}">
                {member.user.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <a href="/staff/{member.id}" class="btn-ghost btn-sm">View</a>
                <form method="POST" action="?/toggleActive" use:enhance>
                  <input type="hidden" name="userId" value={member.user.id} />
                  <button type="submit" class="btn-ghost btn-sm {member.user.isActive ? 'text-red-500' : 'text-emerald-600'}">
                    {member.user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="8" class="text-center py-12 text-slate-400">
              {data.search ? `No staff found for "${data.search}"` : 'No staff yet. Add your first staff member.'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if data.totalPages > 1}
    <div class="flex items-center justify-between mt-4 text-sm text-slate-600">
      <p>Page {data.page} of {data.totalPages}</p>
      <div class="flex gap-2">
        {#if data.page > 1}
          <a href="?page={data.page - 1}&search={data.search}" class="btn-secondary btn-sm">← Prev</a>
        {/if}
        {#if data.page < data.totalPages}
          <a href="?page={data.page + 1}&search={data.search}" class="btn-secondary btn-sm">Next →</a>
        {/if}
      </div>
    </div>
  {/if}
</div>
