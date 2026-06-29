<!-- src/routes/(app)/staff/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { 
    Users, UserPlus, Eye, UserCheck, UserX,
    Mail, Briefcase, Building2, BadgeCheck, Shield,
    ChevronLeft, ChevronRight, Loader2, AlertCircle,
    Calendar, Phone, MapPin, Award, Search
  } from 'lucide-svelte';

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

  const roleIcon: Record<string, any> = {
    SUPER_ADMIN: Shield,
    ADMIN:       BadgeCheck,
    TEACHER:     Award,
  };

  // Calculate summary statistics
  const summaryStats = $derived({
    total: data.staff.length,
    active: data.staff.filter(s => s.user.isActive).length,
    inactive: data.staff.filter(s => !s.user.isActive).length,
    teachers: data.staff.filter(s => s.user.role === 'TEACHER').length,
    adminStaff: data.staff.filter(s => ['SUPER_ADMIN', 'ADMIN'].includes(s.user.role)).length
  });
</script>

<svelte:head>
  <title>Staff — LSAI</title>
</svelte:head>

<div class="staff-container">
  <div class="staff-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <Users size={24} />
        </div>
        <div>
          <h1 class="page-title">Staff</h1>
          <p class="page-subtitle">{data.total} member{data.total !== 1 ? 's' : ''} total</p>
        </div>
      </div>
      <a href="/staff/new" class="add-staff-btn">
        <UserPlus size={16} />
        Add Staff
      </a>
    </div>

    <!-- Summary Cards -->
    {#if data.staff.length > 0}
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-icon">
            <Users size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Total Staff</p>
            <p class="summary-value">{summaryStats.total}</p>
          </div>
        </div>
        <div class="summary-card active">
          <div class="summary-icon">
            <UserCheck size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Active</p>
            <p class="summary-value">{summaryStats.active}</p>
          </div>
        </div>
        <div class="summary-card inactive">
          <div class="summary-icon">
            <UserX size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Inactive</p>
            <p class="summary-value">{summaryStats.inactive}</p>
          </div>
        </div>
        <div class="summary-card teachers">
          <div class="summary-icon">
            <Award size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Teachers</p>
            <p class="summary-value">{summaryStats.teachers}</p>
          </div>
        </div>
        <div class="summary-card admin">
          <div class="summary-icon">
            <Shield size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Admin</p>
            <p class="summary-value">{summaryStats.adminStaff}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Search -->
    <div class="search-card">
      <div class="search-wrapper">
        <Search size={16} class="search-icon" />
        <input
          type="search"
          bind:value={search}
          oninput={onSearchInput}
          placeholder="Search by name, ID, position or email…"
          class="search-input"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="staff-table">
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
          {#each data.staff as member (member.id)}
            {@const Icon = roleIcon[member.user.role] || Shield}
            <tr class="staff-row">
              <td>
                <div class="staff-info">
                  <div class="staff-avatar">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div>
                    <p class="staff-name">{member.firstName} {member.lastName}</p>
                    <p class="staff-position">{member.position ?? '—'}</p>
                  </div>
                </div>
              </td>
              <td class="employee-id">{member.employeeId}</td>
              <td>
                <div class="position-cell">
                  <Briefcase size={12} />
                  {member.position ?? '—'}
                </div>
              </td>
              <td>
                <div class="department-cell">
                  <Building2 size={12} />
                  {member.department ?? '—'}
                </div>
              </td>
              <td>
                <div class="email-cell">
                  <Mail size={12} />
                  {member.user.email}
                </div>
              </td>
              <td>
                <span class="role-badge {roleColor[member.user.role] ?? 'badge-gray'}">
                  <Icon size={10} />
                  {member.user.role.replace('_', ' ')}
                </span>
              </td>
              <td>
                <span class="status-badge {member.user.isActive ? 'status-active' : 'status-inactive'}">
                  {member.user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <a sveltekit:prefetch href={"/staff/" + member.id} class="action-btn view-btn">
                    <Eye size={14} />
                    View
                  </a>
                  <form method="POST" action="?/toggleActive" use:enhance class="inline-form">
                    <input type="hidden" name="userId" value={member.user.id} />
                    <button type="submit" class="action-btn {member.user.isActive ? 'deactivate-btn' : 'activate-btn'}">
                      {member.user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {:else}
            <tr class="empty-row">
              <td colspan="8" class="empty-state">
                <div class="empty-state-content">
                  <Users size={48} class="empty-icon" />
                  <p>{data.search ? `No staff found for "${data.search}"` : 'No staff yet'}</p>
                  <span class="empty-hint">
                    {data.search ? 'Try a different search term' : 'Add your first staff member'}
                  </span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if data.totalPages > 1}
      <div class="pagination">
        <p>Page {data.page} of {data.totalPages}</p>
        <div class="pagination-buttons">
          {#if data.page > 1}
            <a href="?page={data.page - 1}&search={data.search}" class="pagination-btn">
              <ChevronLeft size={14} />
              Prev
            </a>
          {/if}
          {#if data.page < data.totalPages}
            <a href="?page={data.page + 1}&search={data.search}" class="pagination-btn">
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

  .staff-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .staff-wrapper {
    max-width: 80rem;
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

  .add-staff-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.15s ease;
  }

  .add-staff-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.15s ease;
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .summary-card.total .summary-icon {
    background: #eff6ff;
    color: #2563eb;
  }

  .summary-card.active .summary-icon {
    background: #ecfdf5;
    color: #10b981;
  }

  .summary-card.inactive .summary-icon {
    background: #fef2f2;
    color: #ef4444;
  }

  .summary-card.teachers .summary-icon {
    background: #f5f3ff;
    color: #8b5cf6;
  }

  .summary-card.admin .summary-icon {
    background: #fef3c7;
    color: #f59e0b;
  }

  .summary-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
  }

  /* Search Card */
  .search-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .search-wrapper {
    position: relative;
    padding: 0.75rem 1rem;
  }

  .search-icon {
    position: absolute;
    left: 1.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    max-width: 320px;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    background: white;
  }

  .search-input:focus {
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

  .staff-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .staff-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .staff-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .staff-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .staff-row:hover td {
    background: #f8fafc;
  }

  /* Staff Info */
  .staff-info {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .staff-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: #dbeafe;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .staff-name {
    font-weight: 500;
    color: #0f172a;
    margin-bottom: 0.125rem;
  }

  .staff-position {
    font-size: 0.7rem;
    color: #64748b;
  }

  .employee-id {
    font-family: monospace;
    font-size: 0.75rem;
    color: #475569;
  }

  /* Cell Styles */
  .position-cell,
  .department-cell,
  .email-cell {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #475569;
  }

  /* Badges */
  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
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

  /* Action Buttons */
  .action-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .view-btn {
    color: #2563eb;
  }

  .view-btn:hover {
    background: #eff6ff;
  }

  .activate-btn {
    color: #10b981;
  }

  .activate-btn:hover {
    background: #ecfdf5;
  }

  .deactivate-btn {
    color: #ef4444;
  }

  .deactivate-btn:hover {
    background: #fef2f2;
  }

  .inline-form {
    display: inline;
  }

  /* Empty State */
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
    .staff-container {
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
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .staff-table th,
    .staff-table td {
      padding: 0.5rem;
    }

    .staff-info {
      flex-direction: column;
      text-align: center;
    }

    .action-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .action-btn {
      justify-content: center;
    }

    .pagination {
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }
  }

  /* Dark Mode */
  :global(.dark) .staff-container {
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

  :global(.dark) .add-staff-btn {
    background: #3b82f6;
  }

  :global(.dark) .add-staff-btn:hover {
    background: #2563eb;
  }

  :global(.dark) .summary-card,
  :global(.dark) .search-card,
  :global(.dark) .table-wrapper {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .summary-value {
    color: #f8fafc;
  }

  :global(.dark) .summary-label {
    color: #94a3b8;
  }

  :global(.dark) .summary-card.total .summary-icon {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .summary-card.active .summary-icon {
    background: #064e3b;
    color: #6ee7b7;
  }

  :global(.dark) .summary-card.inactive .summary-icon {
    background: #7f1d1d;
    color: #fecaca;
  }

  :global(.dark) .summary-card.teachers .summary-icon {
    background: #4c1d95;
    color: #c4b5fd;
  }

  :global(.dark) .summary-card.admin .summary-icon {
    background: #78350f;
    color: #fde68a;
  }

  :global(.dark) .search-input {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .search-input::placeholder {
    color: #64748b;
  }

  :global(.dark) .search-input:focus {
    border-color: #3b82f6;
  }

  :global(.dark) .search-icon {
    color: #64748b;
  }

  :global(.dark) .staff-table thead {
    background: #0f172a;
    border-bottom-color: #334155;
  }

  :global(.dark) .staff-table th {
    color: #94a3b8;
  }

  :global(.dark) .staff-table td {
    border-bottom-color: #334155;
  }

  :global(.dark) .staff-row:hover td {
    background: #0f172a;
  }

  :global(.dark) .staff-name {
    color: #f8fafc;
  }

  :global(.dark) .staff-position {
    color: #94a3b8;
  }

  :global(.dark) .staff-avatar {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .position-cell,
  :global(.dark) .department-cell,
  :global(.dark) .email-cell {
    color: #cbd5e1;
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

  :global(.dark) .view-btn {
    color: #60a5fa;
  }

  :global(.dark) .view-btn:hover {
    background: #1e293b;
  }

  :global(.dark) .activate-btn {
    color: #34d399;
  }

  :global(.dark) .activate-btn:hover {
    background: #064e3b;
  }

  :global(.dark) .deactivate-btn {
    color: #f87171;
  }

  :global(.dark) .deactivate-btn:hover {
    background: #7f1d1d;
  }

  :global(.dark) .pagination-btn {
    background: #1e293b;
    border-color: #475569;
    color: #cbd5e1;
  }

  :global(.dark) .pagination-btn:hover {
    background: #334155;
  }

  :global(.dark) .empty-icon {
    color: #475569;
  }

  :global(.dark) .empty-state-content p {
    color: #94a3b8;
  }

  :global(.dark) .empty-hint {
    color: #64748b;
  }
</style>