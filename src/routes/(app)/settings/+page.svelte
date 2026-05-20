<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let activeTab = $state<'year' | 'term' | 'fees' | 'password'>('year');
  let showAddYear = $state(false);
  let showAddTerm = $state(false);
  let showAddFee  = $state(false);

  $effect(() => {
    if (form?.yearSuccess) showAddYear = false;
    if (form?.termSuccess) showAddTerm = false;
    if (form?.feeSuccess)  showAddFee  = false;
  });

  const tabs = [
    { id: 'year',     label: '📅 Academic Years' },
    { id: 'term',     label: '🗓️ Terms' },
    { id: 'fees',     label: '💰 Fee Structures' },
    { id: 'password', label: '🔐 Password' },
  ] as const;
</script>

<svelte:head><title>Settings — SMS</title></svelte:head>

<div class="max-w-3xl">
  <div class="page-header">
    <div><h1 class="page-title">Settings</h1><p class="page-subtitle">System configuration</p></div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
          {activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- ── Academic Years ── -->
  {#if activeTab === 'year'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">Academic Years</h2>
        <button onclick={() => showAddYear = !showAddYear} class="btn-secondary btn-sm">
          {showAddYear ? '✕ Cancel' : '+ New Year'}
        </button>
      </div>

      {#if form?.yearError}<div class="alert-error rounded-xl">{form.yearError}</div>{/if}
      {#if form?.yearSuccess}<div class="alert-success rounded-xl">✅ Academic year saved.</div>{/if}

      {#if showAddYear}
        <div class="card">
          <div class="card-body">
            <form method="POST" action="?/createYear" use:enhance class="space-y-4">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="label">Name *</label>
                  <input name="name" required placeholder="2025/2026" class="input" />
                </div>
                <div>
                  <label class="label">Start Date *</label>
                  <input name="startDate" type="date" required class="input" />
                </div>
                <div>
                  <label class="label">End Date *</label>
                  <input name="endDate" type="date" required class="input" />
                </div>
              </div>
              <button type="submit" class="btn-primary">Create Academic Year</button>
            </form>
          </div>
        </div>
      {/if}

      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {#each data.academicYears as year}
              <tr>
                <td class="font-semibold">{year.name}</td>
                <td>{new Date(year.startDate).toLocaleDateString('en-NG')}</td>
                <td>{new Date(year.endDate).toLocaleDateString('en-NG')}</td>
                <td>
                  {#if year.isCurrent}
                    <span class="badge-green">Current</span>
                  {:else}
                    <form method="POST" action="?/setCurrentYear" use:enhance>
                      <input type="hidden" name="yearId" value={year.id} />
                      <button type="submit" class="btn-secondary btn-sm">Set Current</button>
                    </form>
                  {/if}
                </td>
                <td class="text-slate-400 text-xs">{year.id.slice(0, 8)}</td>
              </tr>
            {:else}
              <tr><td colspan="5" class="text-center py-8 text-slate-400">No academic years yet.</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  <!-- ── Terms ── -->
  {:else if activeTab === 'term'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">Terms</h2>
        <button onclick={() => showAddTerm = !showAddTerm} class="btn-secondary btn-sm">
          {showAddTerm ? '✕ Cancel' : '+ New Term'}
        </button>
      </div>

      {#if form?.termError}<div class="alert-error rounded-xl">{form.termError}</div>{/if}
      {#if form?.termSuccess}<div class="alert-success rounded-xl">✅ Term saved.</div>{/if}

      {#if showAddTerm}
        <div class="card">
          <div class="card-body">
            <form method="POST" action="?/createTerm" use:enhance class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Term Name *</label>
                  <select name="name" required class="input">
                    <option value="">Select…</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                <div>
                  <label class="label">Academic Year *</label>
                  <select name="academicYearId" required class="input">
                    <option value="">Select…</option>
                    {#each data.academicYears as year}
                      <option value={year.id} selected={year.isCurrent}>{year.name}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label class="label">Start Date *</label>
                  <input name="startDate" type="date" required class="input" />
                </div>
                <div>
                  <label class="label">End Date *</label>
                  <input name="endDate" type="date" required class="input" />
                </div>
              </div>
              <button type="submit" class="btn-primary">Create Term</button>
            </form>
          </div>
        </div>
      {/if}

      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Term</th><th>Year</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {#each data.terms as term}
              <tr>
                <td class="font-semibold">{term.name}</td>
                <td class="text-slate-500">{term.academicYear.name}</td>
                <td>{new Date(term.startDate).toLocaleDateString('en-NG')}</td>
                <td>{new Date(term.endDate).toLocaleDateString('en-NG')}</td>
                <td>
                  {#if term.isCurrent}
                    <span class="badge-green">Current</span>
                  {:else}
                    <span class="badge-gray">—</span>
                  {/if}
                </td>
                <td>
                  {#if !term.isCurrent}
                    <form method="POST" action="?/setCurrentTerm" use:enhance>
                      <input type="hidden" name="termId" value={term.id} />
                      <button type="submit" class="btn-secondary btn-sm">Set Current</button>
                    </form>
                  {/if}
                </td>
              </tr>
            {:else}
              <tr><td colspan="6" class="text-center py-8 text-slate-400">No terms yet.</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  <!-- ── Fee Structures ── -->
  {:else if activeTab === 'fees'}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">Fee Structures</h2>
        <button onclick={() => showAddFee = !showAddFee} class="btn-secondary btn-sm">
          {showAddFee ? '✕ Cancel' : '+ Add Fee'}
        </button>
      </div>

      {#if form?.feeError}<div class="alert-error rounded-xl">{form.feeError}</div>{/if}
      {#if form?.feeSuccess}<div class="alert-success rounded-xl">✅ Fee structure saved.</div>{/if}

      {#if showAddFee}
        <div class="card">
          <div class="card-body">
            <form method="POST" action="?/createFee" use:enhance class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Fee Name *</label>
                  <input name="name" required placeholder="School Fees" class="input" />
                </div>
                <div>
                  <label class="label">Amount (₦) *</label>
                  <input name="amount" type="number" required min="0" placeholder="50000" class="input" />
                </div>
              </div>
              <div>
                <label class="label">Description</label>
                <input name="description" placeholder="Termly school fees" class="input" />
              </div>
              <button type="submit" class="btn-primary">Add Fee Structure</button>
            </form>
          </div>
        </div>
      {/if}

      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Name</th><th>Amount</th><th>Description</th></tr></thead>
          <tbody>
            {#each data.feeStructures as fee}
              <tr>
                <td class="font-semibold">{fee.name}</td>
                <td class="font-mono">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(fee.amount)}
                </td>
                <td class="text-slate-500">{fee.description ?? '—'}</td>
              </tr>
            {:else}
              <tr><td colspan="3" class="text-center py-8 text-slate-400">No fee structures yet.</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

  <!-- ── Password ── -->
  {:else if activeTab === 'password'}
    <div class="card max-w-md">
      <div class="card-header"><h2 class="font-semibold text-slate-800">Change Password</h2></div>
      <div class="card-body">
        {#if form?.pwError}<div class="alert-error rounded-xl mb-4">{form.pwError}</div>{/if}
        {#if form?.pwSuccess}<div class="alert-success rounded-xl mb-4">✅ Password updated successfully.</div>{/if}

        <form method="POST" action="?/changePassword" use:enhance class="space-y-4">
          <div>
            <label class="label">Current Password *</label>
            <input name="current" type="password" required class="input" />
          </div>
          <div>
            <label class="label">New Password *</label>
            <input name="new" type="password" required minlength="8" class="input" />
          </div>
          <div>
            <label class="label">Confirm New Password *</label>
            <input name="confirm" type="password" required minlength="8" class="input" />
          </div>
          <button type="submit" class="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  {/if}
</div>
