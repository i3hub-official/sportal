<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { 
    Settings, Calendar, Clock, DollarSign, Lock, 
    Plus, X, Check, AlertCircle, Save, Eye, EyeOff,
    TrendingUp, TrendingDown, FileText, Users, BookOpen,
    ChevronRight, ChevronLeft, Trash2, Edit2
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let activeTab = $state<'year' | 'term' | 'fees' | 'password'>('year');
  let showAddYear = $state(false);
  let showAddTerm = $state(false);
  let showAddFee  = $state(false);
  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);

  $effect(() => {
    if (form?.yearSuccess) showAddYear = false;
    if (form?.termSuccess) showAddTerm = false;
    if (form?.feeSuccess)  showAddFee  = false;
  });

  const tabs = [
    { id: 'year', label: 'Academic Years', icon: Calendar, shortLabel: 'Years' },
    { id: 'term', label: 'Terms', icon: Clock, shortLabel: 'Terms' },
    { id: 'fees', label: 'Fee Structures', icon: DollarSign, shortLabel: 'Fees' },
    { id: 'password', label: 'Password', icon: Lock, shortLabel: 'Password' },
  ] as const;

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 0 
    }).format(amount);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Settings — SMS</title>
</svelte:head>

<div class="settings-container">
  <div class="settings-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <Settings size={24} />
        </div>
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">System configuration</p>
        </div>
      </div>
    </div>

    <!-- Tabs - Responsive with horizontal scroll on mobile -->
    <div class="tabs-container">
      <div class="tabs-scroll">
        {#each tabs as tab}
          <button
            onclick={() => activeTab = tab.id}
            class="tab-btn {activeTab === tab.id ? 'active' : ''}"
          >
            <tab.icon size={18} />
            <span class="tab-label">{tab.label}</span>
            <span class="tab-label-short">{tab.shortLabel}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- ── Academic Years ── -->
    {#if activeTab === 'year'}
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <Calendar size={18} />
            <h2>Academic Years</h2>
          </div>
          <button onclick={() => showAddYear = !showAddYear} class="add-btn">
            {#if showAddYear}
              <X size={16} />
              Cancel
            {:else}
              <Plus size={16} />
              New Year
            {/if}
          </button>
        </div>

        {#if form?.yearError}
          <div class="error-alert">
            <AlertCircle size={16} />
            {form.yearError}
          </div>
        {/if}
        
        {#if form?.yearSuccess}
          <div class="success-alert">
            <Check size={16} />
            Academic year saved successfully.
          </div>
        {/if}

        {#if showAddYear}
          <div class="add-form-card">
            <form method="POST" action="?/createYear" use:enhance class="add-form">
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Name *</label>
                  <input name="name" required placeholder="2025/2026" class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">Start Date *</label>
                  <input name="startDate" type="date" required class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">End Date *</label>
                  <input name="endDate" type="date" required class="form-input" />
                </div>
              </div>
              <button type="submit" class="submit-btn">
                <Save size={16} />
                Create Academic Year
              </button>
            </form>
          </div>
        {/if}

        <div class="table-wrapper">
          <table class="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {#each data.academicYears as year}
                <tr>
                  <td class="year-name">{year.name}</td>
                  <td>{formatDate(year.startDate)}</td>
                  <td>{formatDate(year.endDate)}</td>
                  <td>
                    {#if year.isCurrent}
                      <span class="status-badge current">
                        <Check size={10} />
                        Current
                      </span>
                    {:else}
                      <form method="POST" action="?/setCurrentYear" use:enhance class="inline-form">
                        <input type="hidden" name="yearId" value={year.id} />
                        <button type="submit" class="set-current-btn">
                          Set Current
                        </button>
                      </form>
                    {/if}
                  </td>
                  <td class="record-id">{year.id.slice(0, 8)}</td>
                </tr>
              {:else}
                <tr>
                  <td colspan="5" class="empty-state">
                    <Calendar size={48} class="empty-icon" />
                    <p>No academic years yet</p>
                    <span class="empty-hint">Click "New Year" to create one</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    <!-- ── Terms ── -->
    {:else if activeTab === 'term'}
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <Clock size={18} />
            <h2>Terms</h2>
          </div>
          <button onclick={() => showAddTerm = !showAddTerm} class="add-btn">
            {#if showAddTerm}
              <X size={16} />
              Cancel
            {:else}
              <Plus size={16} />
              New Term
            {/if}
          </button>
        </div>

        {#if form?.termError}
          <div class="error-alert">
            <AlertCircle size={16} />
            {form.termError}
          </div>
        {/if}
        
        {#if form?.termSuccess}
          <div class="success-alert">
            <Check size={16} />
            Term saved successfully.
          </div>
        {/if}

        {#if showAddTerm}
          <div class="add-form-card">
            <form method="POST" action="?/createTerm" use:enhance class="add-form">
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Term Name *</label>
                  <select name="name" required class="form-input">
                    <option value="">Select…</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label">Academic Year *</label>
                  <select name="academicYearId" required class="form-input">
                    <option value="">Select…</option>
                    {#each data.academicYears as year}
                      <option value={year.id} selected={year.isCurrent}>{year.name}</option>
                    {/each}
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label">Start Date *</label>
                  <input name="startDate" type="date" required class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">End Date *</label>
                  <input name="endDate" type="date" required class="form-input" />
                </div>
              </div>
              <button type="submit" class="submit-btn">
                <Save size={16} />
                Create Term
              </button>
            </form>
          </div>
        {/if}

        <div class="table-wrapper">
          <table class="settings-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Year</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each data.terms as term}
                <tr>
                  <td class="term-name">{term.displayName || term.term}</td>
                  <td>{term.academicYear.name}</td>
                  <td>{formatDate(term.startDate)}</td>
                  <td>{formatDate(term.endDate)}</td>
                  <td>
                    {#if term.isCurrent}
                      <span class="status-badge current">
                        <Check size={10} />
                        Current
                      </span>
                    {:else}
                      <form method="POST" action="?/setCurrentTerm" use:enhance class="inline-form">
                        <input type="hidden" name="termId" value={term.id} />
                        <button type="submit" class="set-current-btn">
                          Set Current
                        </button>
                      </form>
                    {/if}
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="5" class="empty-state">
                    <Clock size={48} class="empty-icon" />
                    <p>No terms yet</p>
                    <span class="empty-hint">Click "New Term" to create one</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    <!-- ── Fee Structures ── -->
    {:else if activeTab === 'fees'}
      <div class="settings-section">
        <div class="section-header">
          <div class="section-title">
            <DollarSign size={18} />
            <h2>Fee Structures</h2>
          </div>
          <button onclick={() => showAddFee = !showAddFee} class="add-btn">
            {#if showAddFee}
              <X size={16} />
              Cancel
            {:else}
              <Plus size={16} />
              Add Fee
            {/if}
          </button>
        </div>

        {#if form?.feeError}
          <div class="error-alert">
            <AlertCircle size={16} />
            {form.feeError}
          </div>
        {/if}
        
        {#if form?.feeSuccess}
          <div class="success-alert">
            <Check size={16} />
            Fee structure saved successfully.
          </div>
        {/if}

        {#if showAddFee}
          <div class="add-form-card">
            <form method="POST" action="?/createFee" use:enhance class="add-form">
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Fee Name *</label>
                  <input name="name" required placeholder="School Fees" class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">Amount (₦) *</label>
                  <input name="amount" type="number" required min="0" placeholder="50000" class="form-input" />
                </div>
                <div class="form-field full-width">
                  <label class="form-label">Description</label>
                  <input name="description" placeholder="Termly school fees" class="form-input" />
                </div>
              </div>
              <button type="submit" class="submit-btn">
                <Save size={16} />
                Add Fee Structure
              </button>
            </form>
          </div>
        {/if}

        <div class="table-wrapper">
          <table class="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {#each data.feeStructures as fee}
                <tr>
                  <td class="fee-name">{fee.name}</td>
                  <td class="fee-amount">{formatCurrency(fee.amount)}</td>
                  <td class="fee-description">{fee.description ?? '—'}</td>
                </tr>
              {:else}
                <tr>
                  <td colspan="3" class="empty-state">
                    <DollarSign size={48} class="empty-icon" />
                    <p>No fee structures yet</p>
                    <span class="empty-hint">Click "Add Fee" to create one</span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    <!-- ── Password ── -->
    {:else if activeTab === 'password'}
      <div class="settings-section password-section">
        <div class="section-header">
          <div class="section-title">
            <Lock size={18} />
            <h2>Change Password</h2>
          </div>
        </div>

        {#if form?.pwError}
          <div class="error-alert">
            <AlertCircle size={16} />
            {form.pwError}
          </div>
        {/if}
        
        {#if form?.pwSuccess}
          <div class="success-alert">
            <Check size={16} />
            Password updated successfully.
          </div>
        {/if}

        <div class="password-card">
          <form method="POST" action="?/changePassword" use:enhance class="password-form">
            <div class="form-field">
              <label class="form-label">Current Password *</label>
              <div class="password-wrapper">
                <input 
                  name="current" 
                  type={showCurrentPassword ? 'text' : 'password'} 
                  required 
                  class="form-input password-input" 
                />
                <button 
                  type="button" 
                  onclick={() => showCurrentPassword = !showCurrentPassword}
                  class="password-toggle"
                >
                  {#if showCurrentPassword}
                    <EyeOff size={16} />
                  {:else}
                    <Eye size={16} />
                  {/if}
                </button>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">New Password *</label>
              <div class="password-wrapper">
                <input 
                  name="new" 
                  type={showNewPassword ? 'text' : 'password'} 
                  required 
                  minlength="8" 
                  class="form-input password-input" 
                />
                <button 
                  type="button" 
                  onclick={() => showNewPassword = !showNewPassword}
                  class="password-toggle"
                >
                  {#if showNewPassword}
                    <EyeOff size={16} />
                  {:else}
                    <Eye size={16} />
                  {/if}
                </button>
              </div>
              <p class="password-hint">Minimum 8 characters</p>
            </div>

            <div class="form-field">
              <label class="form-label">Confirm New Password *</label>
              <div class="password-wrapper">
                <input 
                  name="confirm" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required 
                  minlength="8" 
                  class="form-input password-input" 
                />
                <button 
                  type="button" 
                  onclick={() => showConfirmPassword = !showConfirmPassword}
                  class="password-toggle"
                >
                  {#if showConfirmPassword}
                    <EyeOff size={16} />
                  {:else}
                    <Eye size={16} />
                  {/if}
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn">
              <Lock size={16} />
              Update Password
            </button>
          </form>
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

  .settings-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .settings-wrapper {
    max-width: 64rem;
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

  /* Tabs - Responsive with horizontal scroll */
  .tabs-container {
    background: #f1f5f9;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .tabs-container::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-container::-webkit-scrollbar-track {
    background: #e2e8f0;
    border-radius: 2px;
  }

  .tabs-container::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 2px;
  }

  .tabs-scroll {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    min-width: min-content;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    color: #64748b;
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: #1e293b;
    background: rgba(255, 255, 255, 0.5);
  }

  .tab-btn.active {
    background: white;
    color: #0f172a;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .tab-label-short {
    display: none;
  }

  /* Settings Section */
  .settings-section {
    margin-top: 1rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1e293b;
  }

  .section-title h2 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-btn:hover {
    background: #e2e8f0;
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
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
  }

  .success-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
  }

  /* Add Form Card */
  .add-form-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .full-width {
    grid-column: span 1;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
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
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .submit-btn {
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
    align-self: flex-start;
  }

  .submit-btn:hover {
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

  .settings-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .settings-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .settings-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .settings-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .settings-table tr:last-child td {
    border-bottom: none;
  }

  .year-name,
  .term-name,
  .fee-name {
    font-weight: 600;
    color: #0f172a;
  }

  .fee-amount {
    font-weight: 600;
    color: #059669;
  }

  .fee-description {
    color: #64748b;
  }

  .record-id {
    font-family: monospace;
    font-size: 0.7rem;
    color: #94a3b8;
  }

  /* Status Badge */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .status-badge.current {
    background: #ecfdf5;
    color: #065f46;
  }

  .set-current-btn {
    padding: 0.25rem 0.625rem;
    background: #eff6ff;
    color: #1d4ed8;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .set-current-btn:hover {
    background: #dbeafe;
  }

  .inline-form {
    display: inline;
  }

  /* Password Section */
  .password-section {
    max-width: 32rem;
  }

  .password-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .password-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .password-wrapper {
    position: relative;
  }

  .password-input {
    padding-right: 2.5rem;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .password-toggle:hover {
    color: #475569;
  }

  .password-hint {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem !important;
  }

  .empty-state p {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0.5rem 0 0.25rem;
  }

  .empty-icon {
    color: #cbd5e1;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .settings-container {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }

    .title-icon {
      width: 2rem;
      height: 2rem;
    }

    /* Hide full label on mobile, show short label */
    .tab-label {
      display: none;
    }

    .tab-label-short {
      display: inline;
    }

    .tab-btn {
      padding: 0.5rem 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .submit-btn {
      width: 100%;
      justify-content: center;
    }

    .settings-table th,
    .settings-table td {
      padding: 0.5rem;
    }

    /* Make table more readable on mobile */
    .settings-table {
      font-size: 0.75rem;
    }

    .record-id {
      font-size: 0.65rem;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .settings-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .tabs-container {
      background: #1e293b;
    }

    .tabs-container::-webkit-scrollbar-track {
      background: #334155;
    }

    .tab-btn {
      color: #94a3b8;
    }

    .tab-btn:hover {
      color: #f8fafc;
      background: rgba(51, 65, 85, 0.5);
    }

    .tab-btn.active {
      background: #334155;
      color: #f8fafc;
    }

    .section-title {
      color: #f8fafc;
    }

    .add-btn {
      background: #334155;
      color: #cbd5e1;
    }

    .add-btn:hover {
      background: #475569;
    }

    .add-form-card,
    .table-wrapper,
    .password-card {
      background: #1e293b;
      border-color: #334155;
    }

    .form-input,
    .form-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .form-input:focus {
      border-color: #3b82f6;
    }

    .settings-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .settings-table th {
      color: #94a3b8;
    }

    .settings-table td {
      border-bottom-color: #334155;
    }

    .year-name,
    .term-name,
    .fee-name {
      color: #f8fafc;
    }

    .status-badge.current {
      background: #064e3b;
      color: #6ee7b7;
    }

    .set-current-btn {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .set-current-btn:hover {
      background: #2d4a7a;
    }

    .password-toggle {
      color: #64748b;
    }

    .password-toggle:hover {
      color: #94a3b8;
    }

    .empty-icon {
      color: #475569;
    }

    .empty-state p {
      color: #94a3b8;
    }
  }
</style>