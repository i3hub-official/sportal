<!-- src/routes/(app)/subjects/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { 
    BookOpen, Plus, X, Check, AlertCircle, 
    Code, Bookmark, Library, GraduationCap,
    Eye, Edit2, Trash2
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showAdd = $state(false);
  $effect(() => { if (form?.success) showAdd = false; });
</script>

<svelte:head>
  <title>Subjects — SMS</title>
</svelte:head>

<div class="subjects-container">
  <div class="subjects-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 class="page-title">Subjects</h1>
          <p class="page-subtitle">{data.subjects.length} subjects total</p>
        </div>
      </div>
      <button onclick={() => showAdd = !showAdd} class="add-subject-btn">
        {#if showAdd}
          <X size={16} />
          Cancel
        {:else}
          <Plus size={16} />
          Add Subject
        {/if}
      </button>
    </div>

    {#if form?.error}
      <div class="error-alert">
        <AlertCircle size={16} />
        {form.error}
      </div>
    {/if}

    {#if form?.success}
      <div class="success-alert">
        <Check size={16} />
        {form.success}
      </div>
    {/if}

    {#if showAdd}
      <div class="add-form-card">
        <div class="card-header">
          <Bookmark size={18} />
          <h3>Add New Subject</h3>
        </div>
        <div class="card-body">
          <form method="POST" action="?/create" use:enhance class="add-form">
            <div class="form-group">
              <label class="form-label">
                <BookOpen size={14} />
                Subject Name *
              </label>
              <input 
                name="name" 
                required 
                placeholder="Mathematics" 
                class="form-input" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <Code size={14} />
                Subject Code *
              </label>
              <input 
                name="code" 
                required 
                placeholder="MTH" 
                class="form-input code-input" 
              />
            </div>
            <button type="submit" class="create-btn">
              <Check size={16} />
              Add Subject
            </button>
          </form>
        </div>
      </div>
    {/if}

    <div class="table-wrapper">
      <table class="subjects-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Code</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {#each data.subjects as subject}
            <tr class="subject-row">
              <td class="subject-cell">
                <div class="subject-info">
                  <div class="subject-icon">
                    <BookOpen size={16} />
                  </div>
                  <span class="subject-name">{subject.name}</span>
                </div>
              </td>
              <td class="code-cell">
                <div class="subject-code">
                  <Code size={12} />
                  <span>{subject.code}</span>
                </div>
              </td>
              <td class="status-cell">
                <span class="status-badge {subject.isActive ? 'status-active' : 'status-inactive'}">
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td class="action-cell">
                <form method="POST" action="?/toggle" use:enhance class="inline-form">
                  <input type="hidden" name="subjectId" value={subject.id} />
                  <button 
                    type="submit" 
                    class="action-btn {subject.isActive ? 'deactivate-btn' : 'activate-btn'}"
                  >
                    {subject.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </td>
            </tr>
          {/each}
          
          {#if data.subjects.length === 0}
            <tr class="empty-row">
              <td colspan="4" class="empty-state">
                <div class="empty-state-content">
                  <Library size={48} class="empty-icon" />
                  <p>No subjects yet</p>
                  <span class="empty-hint">Click "Add Subject" to create your first subject</span>
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Summary Section -->
    {#if data.subjects.length > 0}
      <div class="summary-footer">
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{data.subjects.length}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Active:</span>
            <span class="stat-value active">{data.subjects.filter(s => s.isActive).length}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Inactive:</span>
            <span class="stat-value inactive">{data.subjects.filter(s => !s.isActive).length}</span>
          </div>
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

  .subjects-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .subjects-wrapper {
    max-width: 64rem;
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

  .add-subject-btn {
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

  .add-subject-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
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

  /* Add Form Card */
  .add-form-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1e293b;
  }

  .card-body {
    padding: 1.25rem;
  }

  .add-form {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
  }

  .form-group {
    flex: 1;
    min-width: 180px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    background: white;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .code-input {
    font-family: monospace;
    text-transform: uppercase;
  }

  .create-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    height: 2.5rem;
  }

  .create-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Table */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
  }

  .subjects-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .subjects-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .subjects-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .subjects-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .subject-row:hover td {
    background: #f8fafc;
  }

  /* Subject Info */
  .subject-info {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .subject-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: #eff6ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .subject-name {
    font-weight: 600;
    color: #0f172a;
  }

  .subject-code {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: #f1f5f9;
    border-radius: 0.375rem;
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: #475569;
  }

  /* Status Badge */
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

  /* Action Button */
  .inline-form {
    display: inline;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
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

  /* Summary Footer */
  .summary-footer {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
  }

  .summary-stats {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .stat-label {
    color: #64748b;
    font-weight: 500;
  }

  .stat-value {
    font-weight: 700;
    color: #0f172a;
  }

  .stat-value.active {
    color: #10b981;
  }

  .stat-value.inactive {
    color: #ef4444;
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

  /* Responsive Design */
  @media (max-width: 768px) {
    .subjects-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    .add-form {
      flex-direction: column;
    }

    .form-group {
      width: 100%;
    }

    .create-btn {
      width: 100%;
      justify-content: center;
    }

    .subjects-table th,
    .subjects-table td {
      padding: 0.5rem;
    }

    .subject-info {
      flex-direction: column;
      text-align: center;
    }

    .summary-stats {
      justify-content: center;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .subjects-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .add-subject-btn {
      background: #3b82f6;
    }

    .add-subject-btn:hover {
      background: #2563eb;
    }

    .add-form-card,
    .table-wrapper,
    .summary-footer {
      background: #1e293b;
      border-color: #334155;
    }

    .card-header {
      color: #f8fafc;
      border-bottom-color: #334155;
    }

    .form-input {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .form-input::placeholder {
      color: #64748b;
    }

    .form-input:focus {
      border-color: #3b82f6;
    }

    .subjects-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .subjects-table th {
      color: #94a3b8;
    }

    .subjects-table td {
      border-bottom-color: #334155;
    }

    .subject-row:hover td {
      background: #0f172a;
    }

    .subject-icon {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .subject-name {
      color: #f8fafc;
    }

    .subject-code {
      background: #334155;
      color: #cbd5e1;
    }

    .status-active {
      background: #064e3b;
      color: #6ee7b7;
    }

    .status-inactive {
      background: #7f1d1d;
      color: #fecaca;
    }

    .activate-btn:hover {
      background: #064e3b;
    }

    .deactivate-btn:hover {
      background: #7f1d1d;
    }

    .stat-value {
      color: #f8fafc;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>