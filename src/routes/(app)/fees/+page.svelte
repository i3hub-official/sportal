<!-- src/routes/(app)/fees/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { 
    Wallet, AlertTriangle, Filter, Users, 
    Receipt, CreditCard, DollarSign, CheckCircle, 
    Clock, AlertCircle, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, FileText
  } from 'lucide-svelte';
  
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
    PAID: 'badge-green', 
    PARTIAL: 'badge-yellow', 
    PENDING: 'badge-gray', 
    OVERDUE: 'badge-red'
  };

  const statusIcon: Record<string, any> = {
    PAID: CheckCircle,
    PARTIAL: Clock,
    PENDING: AlertCircle,
    OVERDUE: AlertTriangle
  };

  // Calculate summary stats
  const summaryStats = $derived({
    totalCollected: data.totalPaid,
    totalBalance: data.totalBalance,
    collectionRate: data.totalCollected > 0 
      ? ((data.totalPaid / (data.totalPaid + data.totalBalance)) * 100).toFixed(1)
      : 0
  });
</script>

<svelte:head>
  <title>Fees — SMS</title>
</svelte:head>

<div class="fees-container">
  <div class="fees-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <Wallet size={24} />
        </div>
        <div>
          <h1 class="page-title">Fee Records</h1>
          <p class="page-subtitle">{data.total} records</p>
        </div>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="summary-grid">
      <div class="summary-card collected">
        <div class="summary-icon">
          <DollarSign size={24} />
        </div>
        <div class="summary-info">
          <p class="summary-label">Total Collected</p>
          <p class="summary-value">{formatNGN(data.totalPaid)}</p>
          <p class="summary-trend positive">
            <TrendingUp size={12} />
            +{summaryStats.collectionRate}% of total
          </p>
        </div>
      </div>
      
      <div class="summary-card balance">
        <div class="summary-icon">
          <AlertTriangle size={24} />
        </div>
        <div class="summary-info">
          <p class="summary-label">Outstanding Balance</p>
          <p class="summary-value">{formatNGN(data.totalBalance)}</p>
          <p class="summary-trend negative">
            <TrendingDown size={12} />
            Due for collection
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-body">
        <div class="search-wrapper">
          <input 
            type="search" 
            bind:value={search} 
            oninput={updateFilters}
            placeholder="Search student…" 
            class="search-input" 
          />
        </div>

        <select bind:value={status} onchange={updateFilters} class="filter-select">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>

        <select bind:value={classId} onchange={updateFilters} class="filter-select">
          <option value="">All Classes</option>
          {#each data.classes as cls}
            <option value={cls.id}>{cls.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="fees-table">
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
            <tr class="fee-row">
              <td>
                <div class="student-info">
                  <div class="student-avatar">
                    {record.student.firstName?.charAt(0)}{record.student.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p class="student-name">{record.student.lastName}, {record.student.firstName}</p>
                    <p class="student-admission">{record.student.admissionNo}</p>
                  </div>
                </div>
               </td>
              <td>
                <div class="fee-type">
                  <Receipt size={12} />
                  <span>{record.feeStructure.name}</span>
                </div>
               </td>
              <td class="amount">{formatNGN(record.feeStructure.amount)}</td>
              <td class="paid-amount">{formatNGN(record.amountPaid)}</td>
              <td class="balance-amount">{formatNGN(record.balance)}</td>
              <td>
                {#if record.status && statusIcon[record.status]}
                  {@const StatusIconComponent = statusIcon[record.status]}
                  <span class="status-badge {statusColor[record.status] ?? 'badge-gray'}">
                    <StatusIconComponent size={10} />
                    {record.status}
                  </span>
                {:else}
                  <span class="status-badge badge-gray">—</span>
                {/if}
              </td>
              <td>
                {#if record.receiptNo}
                  <span class="receipt-no">
                    <FileText size={10} />
                    {record.receiptNo}
                  </span>
                {:else}
                  <span class="no-receipt">—</span>
                {/if}
              </td>
            </tr>
          {:else}
            <tr class="empty-row">
              <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                  <Wallet size={48} class="empty-icon" />
                  <p>No fee records found</p>
                  <span class="empty-hint">Try adjusting your search or filters</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if data.totalPages > 1}
      <div class="pagination">
        <p>Page {data.page} of {data.totalPages}</p>
        <div class="pagination-buttons">
          {#if data.page > 1}
            <a href="?page={data.page - 1}&search={data.search}&status={data.status}&class={data.classId}" 
               class="pagination-btn">
              <ChevronLeft size={14} />
              Prev
            </a>
          {/if}
          {#if data.page < data.totalPages}
            <a href="?page={data.page + 1}&search={data.search}&status={data.status}&class={data.classId}" 
               class="pagination-btn">
              Next
              <ChevronRight size={14} />
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .fees-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .fees-wrapper {
    max-width: 80rem;
    margin: 0 auto;
  }

  /* Page Header */
  .page-header {
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

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.15s ease;
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .summary-card.collected .summary-icon {
    background: #ecfdf5;
    color: #10b981;
  }

  .summary-card.balance .summary-icon {
    background: #fef2f2;
    color: #ef4444;
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .summary-info {
    flex: 1;
  }

  .summary-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .summary-trend {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .summary-trend.positive {
    color: #10b981;
  }

  .summary-trend.negative {
    color: #ef4444;
  }

  /* Filters Card */
  .filters-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .filters-body {
    padding: 1rem 1.25rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    min-width: 140px;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Table */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
  }

  .fees-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .fees-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .fees-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .fees-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .fee-row:hover td {
    background: #f8fafc;
  }

  /* Student Info */
  .student-info {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .student-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #dbeafe;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .student-name {
    font-weight: 500;
    color: #0f172a;
    margin-bottom: 0.125rem;
  }

  .student-admission {
    font-size: 0.7rem;
    color: #64748b;
    font-family: 'SF Mono', monospace;
  }

  /* Fee Type */
  .fee-type {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #475569;
  }

  /* Amounts */
  .amount,
  .paid-amount,
  .balance-amount {
    font-weight: 500;
  }

  .paid-amount {
    color: #10b981;
  }

  .balance-amount {
    color: #ef4444;
  }

  /* Status Badge */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .badge-green {
    background: #ecfdf5;
    color: #065f46;
  }

  .badge-yellow {
    background: #fffbeb;
    color: #92400e;
  }

  .badge-gray {
    background: #f1f5f9;
    color: #475569;
  }

  .badge-red {
    background: #fef2f2;
    color: #991b1b;
  }

  /* Receipt */
  .receipt-no {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'SF Mono', monospace;
    font-size: 0.7rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
  }

  .no-receipt {
    color: #cbd5e1;
  }

  /* Empty State */
  .empty-row td {
    padding: 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem !important;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-icon {
    color: #cbd5e1;
    margin-bottom: 0.5rem;
  }

  .empty-state-content p {
    color: #64748b;
    font-size: 0.875rem;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Pagination */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #475569;
  }

  .pagination-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.875rem;
    background: white;
    color: #475569;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .pagination-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .fees-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .filters-body {
      flex-direction: column;
    }

    .search-wrapper,
    .filter-select {
      width: 100%;
    }

    .fees-table th,
    .fees-table td {
      padding: 0.75rem;
    }

    .student-info {
      flex-direction: column;
      text-align: center;
    }

    .pagination {
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .fees-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .summary-card,
    .filters-card,
    .table-wrapper {
      background: #1e293b;
      border-color: #334155;
    }

    .summary-value {
      color: #f8fafc;
    }

    .search-input,
    .filter-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .search-input::placeholder {
      color: #64748b;
    }

    .search-input:focus,
    .filter-select:focus {
      border-color: #3b82f6;
    }

    .fees-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .fees-table th {
      color: #94a3b8;
    }

    .fees-table td {
      border-bottom-color: #334155;
    }

    .fee-row:hover td {
      background: #0f172a;
    }

    .student-name {
      color: #f8fafc;
    }

    .student-avatar {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .fee-type {
      color: #cbd5e1;
    }

    .badge-green {
      background: #064e3b;
      color: #6ee7b7;
    }

    .badge-yellow {
      background: #78350f;
      color: #fde68a;
    }

    .badge-gray {
      background: #334155;
      color: #cbd5e1;
    }

    .badge-red {
      background: #7f1d1d;
      color: #fecaca;
    }

    .receipt-no {
      background: #334155;
      color: #94a3b8;
    }

    .pagination-btn {
      background: #1e293b;
      border-color: #475569;
      color: #cbd5e1;
    }

    .pagination-btn:hover {
      background: #334155;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>