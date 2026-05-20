<!-- src/routes/(app)/students/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { 
    Filter, Plus, Eye, Users, GraduationCap, 
    BookOpen, ChevronLeft, ChevronRight, UserPlus 
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let search  = $state(data.search  ?? '');
  let level   = $state(data.level   ?? '');
  let classId = $state(data.classId ?? '');
  let timer: ReturnType<typeof setTimeout>;

  function updateFilters() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const p = new URLSearchParams();
      if (search)  p.set('search', search);
      if (level)   p.set('level', level);
      if (classId) p.set('class', classId);
      p.set('page', '1');
      goto(`?${p}`, { keepFocus: true });
    }, 300);
  }

  const levelColor: Record<string, string> = {
    NURSERY:   'badge-purple',
    PRIMARY:   'badge-blue',
    SECONDARY: 'badge-green',
  };
</script>

<svelte:head>
  <title>Students — SMS</title>
</svelte:head>

<div class="students-container">
  <div class="page-header">
    <div class="header-title-section">
      <div class="title-icon">
        <Users size={24} />
      </div>
      <div>
        <h1 class="page-title">Students</h1>
        <p class="page-subtitle">{data.total} student{data.total !== 1 ? 's' : ''}</p>
      </div>
    </div>
    <a href="/students/new" class="enrol-btn">
      <UserPlus size={16} />
      Enrol Student
    </a>
  </div>

  <!-- Filters -->
  <div class="filters-card">
    <div class="filters-body">
      <div class="search-wrapper">
        <input 
          type="search" 
          bind:value={search} 
          oninput={updateFilters}
          placeholder="Search name or admission no…" 
          class="search-input" 
        />
      </div>

      <select bind:value={level} onchange={updateFilters} class="filter-select">
        <option value="">All Levels</option>
        <option value="NURSERY">Nursery</option>
        <option value="PRIMARY">Primary</option>
        <option value="SECONDARY">Secondary</option>
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
    <table class="student-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Admission No</th>
          <th>Level</th>
          <th>Class</th>
          <th>Gender</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.students as student}
          <tr>
            <td>
              <div class="student-info">
                <div class="student-avatar">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <span class="student-name">{student.lastName}, {student.firstName}</span>
              </div>
            </td>
            <td class="admission-no">{student.admissionNo}</td>
            <td><span class="level-badge {levelColor[student.level] ?? 'badge-gray'}">{student.level}</span></td>
            <td class="class-name">{student.class?.name ?? '—'}</td>
            <td>{student.gender ?? '—'}</td>
            <td>
              <a href="/students/{student.id}" class="view-btn">
                <Eye size={14} />
                View
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="empty-state">
              <div class="empty-state-content">
                <GraduationCap size={48} class="empty-icon" />
                <p>No students found</p>
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
          <a 
            href="?page={data.page - 1}&search={data.search}&level={data.level}&class={data.classId}" 
            class="pagination-btn">
            <ChevronLeft size={14} />
            Prev
          </a>
        {/if}
        {#if data.page < data.totalPages}
          <a 
            href="?page={data.page + 1}&search={data.search}&level={data.level}&class={data.classId}" 
            class="pagination-btn">
            Next
            <ChevronRight size={14} />
          </a>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .students-container {
    padding: 1.5rem;
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

  .enrol-btn {
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

  .enrol-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Filters Card */
  .filters-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.25rem;
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
    background: white;
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

  .student-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .student-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .student-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .student-table td {
    padding: 0.75rem 1rem;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  .student-table tbody tr:last-child td {
    border-bottom: none;
  }

  .student-table tbody tr:hover td {
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
    background: #d1fae5;
    color: #047857;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .student-name {
    font-weight: 500;
    color: #0f172a;
  }

  .admission-no {
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
    font-size: 0.75rem;
    color: #64748b;
  }

  .class-name {
    color: #475569;
  }

  /* Badges */
  .level-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
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

  /* Action Buttons */
  .view-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    background: transparent;
    color: #3b82f6;
    text-decoration: none;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .view-btn:hover {
    background: #eff6ff;
    color: #1d4ed8;
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
    gap: 1rem;
  }

  .empty-icon {
    color: #cbd5e1;
  }

  .empty-state-content p {
    color: #94a3b8;
    font-size: 0.875rem;
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
    .students-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .title-icon :global(svg) {
      width: 18px;
      height: 18px;
    }

    .enrol-btn {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }

    .filters-body {
      flex-direction: column;
    }

    .search-wrapper {
      width: 100%;
    }

    .filter-select {
      width: 100%;
    }

    .student-table th,
    .student-table td {
      padding: 0.5rem 0.75rem;
    }

    .student-name {
      font-size: 0.8125rem;
    }

    .pagination {
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .page-title {
      color: #f8fafc;
    }

    .page-subtitle {
      color: #94a3b8;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .filters-card {
      background: #1e293b;
      border-color: #334155;
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

    .search-icon {
      color: #64748b;
    }

    .table-wrapper {
      background: #1e293b;
      border-color: #334155;
    }

    .student-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .student-table th {
      color: #94a3b8;
    }

    .student-table td {
      color: #cbd5e1;
      border-bottom-color: #334155;
    }

    .student-table tbody tr:hover td {
      background: #0f172a;
    }

    .student-name {
      color: #f8fafc;
    }

    .student-avatar {
      background: #064e3b;
      color: #6ee7b7;
    }

    .badge-purple {
      background: #4c1d95;
      color: #c4b5fd;
    }

    .badge-blue {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .badge-green {
      background: #064e3b;
      color: #6ee7b7;
    }

    .badge-gray {
      background: #334155;
      color: #cbd5e1;
    }

    .view-btn:hover {
      background: #1e293b;
    }

    .pagination-btn {
      background: #1e293b;
      border-color: #475569;
      color: #cbd5e1;
    }

    .pagination-btn:hover {
      background: #334155;
      border-color: #64748b;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>