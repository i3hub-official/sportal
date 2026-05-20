<!-- src/routes/(app)/fees/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  let search  = $state(data.search  ?? '');
  let status  = $state(data.status  ?? '');
  let classId = $state(data.classId ?? '');
  let timer: ReturnType<typeof setTimeout>;

  function updateFilters() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const p = new URLSearchParams();
      if (search)  p.set('search', search);
      if (status)  p.set('status', status);
      if (classId) p.set('class', classId);
      p.set('page', '1');
      goto(`?${p}`, { keepFocus: true });
    }, 300);
  }

  function formatNGN(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);
  }

  const statusColor: Record<string, string> = {
    PAID: 'badge-green', PARTIAL: 'badge-yellow', PENDING: 'badge-gray', OVERDUE: 'badge-red'
  };
</script>

<svelte:head><title>Fees — SMS</title></svelte:head>

<div>
  <div class="page-header">
    <div><h1 class="page-title">Fee Records</h1><p class="page-subtitle">{data.total} records</p></div>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 gap-4 mb-5">
    <div class="card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">💰</div>
      <div>
        <p class="text-xl font-bold text-slate-900">{formatNGN(data.totalPaid)}</p>
        <p class="text-xs text-slate-400">Total Collected</p>
      </div>
    </div>
    <div class="card p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-lg">⚠️</div>
      <div>
        <p class="text-xl font-bold text-slate-900">{formatNGN(data.totalBalance)}</p>
        <p class="text-xs text-slate-400">Outstanding Balance</p>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="card mb-5">
    <div class="card-body flex flex-wrap gap-3">
      <input type="search" bind:value={search} oninput={updateFilters}
        placeholder="Search student…" class="input max-w-xs" />
      <select bind:value={status} onchange={updateFilters} class="input w-36">
        <option value="">All Status</option>
        <option value="PAID">Paid</option>
        <option value="PARTIAL">Partial</option>
        <option value="PENDING">Pending</option>
        <option value="OVERDUE">Overdue</option>
      </select>
      <select bind:value={classId} onchange={updateFilters} class="input w-44">
        <option value="">All Classes</option>
        {#each data.classes as cls}
          <option value={cls.id}>{cls.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Fee Type</th>
          <th>Amount</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Receipt</th>
        </tr>
      </thead>
      <tbody>
        {#each data.records as record}
          <tr>
            <td>
              <p class="font-medium">{record.student.lastName}, {record.student.firstName}</p>
              <p class="text-xs text-slate-400 font-mono">{record.student.admissionNo}</p>
            </td>
            <td>{record.feeStructure.name}</td>
            <td>{formatNGN(record.feeStructure.amount)}</td>
            <td class="text-emerald-600 font-medium">{formatNGN(record.amountPaid)}</td>
            <td class="text-red-500 font-medium">{formatNGN(record.balance)}</td>
            <td><span class="{statusColor[record.status] ?? 'badge-gray'}">{record.status}</span></td>
            <td class="font-mono text-xs text-slate-400">{record.receiptNo ?? '—'}</td>
          </tr>
        {:else}
          <tr><td colspan="7" class="text-center py-12 text-slate-400">No fee records found.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if data.totalPages > 1}
    <div class="flex items-center justify-between mt-4 text-sm text-slate-600">
      <p>Page {data.page} of {data.totalPages}</p>
      <div class="flex gap-2">
        {#if data.page > 1}<a href="?page={data.page - 1}" class="btn-secondary btn-sm">← Prev</a>{/if}
        {#if data.page < data.totalPages}<a href="?page={data.page + 1}" class="btn-secondary btn-sm">Next →</a>{/if}
      </div>
    </div>
  {/if}
</div>
