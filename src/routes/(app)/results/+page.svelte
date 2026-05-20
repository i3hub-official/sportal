<!-- src/routes/(app)/results/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { 
    BarChart3, BookOpen, Users, Filter, Save, 
    TrendingUp, Award, CheckCircle, AlertCircle,
    Loader2, Edit2, Eye, Download, Printer
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedClass   = $state('');
  let selectedTerm    = $state(data.currentTerm?.id ?? '');
  let selectedSubject = $state('');
  let students        = $state<any[]>([]);
  let loading         = $state(false);
  let saving          = $state<Record<string, boolean>>({});

  async function loadStudents() {
    if (!selectedClass || !selectedTerm) return;
    loading = true;
    const res = await fetch(`/api/results?classId=${selectedClass}&termId=${selectedTerm}&subjectId=${selectedSubject}`);
    const json = await res.json();
    students = json.data ?? [];
    loading = false;
  }

  async function saveScore(resultId: string | null, studentId: string, subjectId: string, field: string, value: string) {
    const key = `${studentId}-${subjectId}-${field}`;
    saving[key] = true;
    
    await fetch('/api/results', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        resultId, studentId, subjectId,
        classId: selectedClass,
        termId:  selectedTerm,
        [field]: parseFloat(value) || 0,
      }),
    });
    
    saving[key] = false;
    
    // Refresh to show updated totals/grades
    await loadStudents();
  }

  function getScoreColor(score: number | null, max: number) {
    if (!score) return '';
    const percentage = (score / max) * 100;
    if (percentage >= 70) return 'score-excellent';
    if (percentage >= 50) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
  }

  // Calculate summary statistics
  const summaryStats = $derived({
    totalStudents: students.length,
    subjectsCount: new Set(students.map(s => s.subjectId)).size,
    averageTotal: students.length > 0 
      ? (students.reduce((sum, s) => sum + (s.totalScore || 0), 0) / students.length).toFixed(1)
      : 0,
    passRate: students.length > 0
      ? ((students.filter(s => (s.totalScore || 0) >= 50).length / students.length) * 100).toFixed(1)
      : 0
  });
</script>

<svelte:head>
  <title>Results — SMS</title>
</svelte:head>

<div class="results-container">
  <div class="results-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 class="page-title">Results</h1>
          <p class="page-subtitle">Enter and manage student scores</p>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    {#if students.length > 0}
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">
            <Users size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Total Students</p>
            <p class="summary-value">{summaryStats.totalStudents}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <BookOpen size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Subjects</p>
            <p class="summary-value">{summaryStats.subjectsCount}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <TrendingUp size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Average Score</p>
            <p class="summary-value">{summaryStats.averageTotal}%</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon">
            <Award size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Pass Rate</p>
            <p class="summary-value">{summaryStats.passRate}%</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-body">
        <div class="filter-group">
          <label class="filter-label">Term *</label>
          <select bind:value={selectedTerm} onchange={loadStudents} class="filter-select">
            <option value="">Select term…</option>
            {#each data.terms as term}
              <option value={term.id}>{term.name}</option>
            {/each}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Class *</label>
          <select bind:value={selectedClass} onchange={loadStudents} class="filter-select">
            <option value="">Select class…</option>
            {#each data.classes as cls}
              <option value={cls.id}>{cls.name}</option>
            {/each}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Subject</label>
          <select bind:value={selectedSubject} onchange={loadStudents} class="filter-select">
            <option value="">All subjects</option>
            {#each data.subjects as sub}
              <option value={sub.id}>{sub.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="loading-state">
        <Loader2 size={32} class="spinning" />
        <p>Loading results...</p>
      </div>
    {:else if students.length > 0}
      <div class="table-wrapper">
        <table class="results-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>CA (40)</th>
              <th>Exam (60)</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {#each students as row}
              {@const caKey = `${row.studentId}-${row.subjectId}-ca`}
              {@const examKey = `${row.studentId}-${row.subjectId}-exam`}
              <tr class="result-row">
                <td>
                  <div class="student-info">
                    <div class="student-avatar">
                      {row.studentName?.charAt(0) || 'S'}
                    </div>
                    <a href="/results/{row.studentId}" class="student-link">
                      {row.studentName}
                    </a>
                  </div>
                </td>
                <td class="subject-name">{row.subjectName}</td>
                <td class="score-cell">
                  <div class="score-input-wrapper">
                    <input 
                      type="number" 
                      min="0" 
                      max="40" 
                      value={row.caScore ?? 0}
                      onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'caScore', (e.target as HTMLInputElement).value)}
                      class="score-input ca-input" 
                    />
                    <span class="score-max">/40</span>
                    {#if saving[caKey]}
                      <Save size={12} class="saving-icon spinning" />
                    {/if}
                  </div>
                </td>
                <td class="score-cell">
                  <div class="score-input-wrapper">
                    <input 
                      type="number" 
                      min="0" 
                      max="60" 
                      value={row.examScore ?? 0}
                      onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'examScore', (e.target as HTMLInputElement).value)}
                      class="score-input exam-input" 
                    />
                    <span class="score-max">/60</span>
                    {#if saving[examKey]}
                      <Save size={12} class="saving-icon spinning" />
                    {/if}
                  </div>
                </td>
                <td class="total-cell">
                  <span class="total-score {getScoreColor(row.totalScore, 100)}">
                    {row.totalScore ?? '—'}
                  </span>
                </td>
                <td>
                  <span class="grade-badge {row.grade ? `grade-${row.grade.charAt(0)}` : ''}">
                    {row.grade ?? '—'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if selectedClass && selectedTerm}
      <div class="empty-state">
        <div class="empty-state-content">
          <AlertCircle size={48} class="empty-icon" />
          <p>No results found</p>
          <span class="empty-hint">Select different filters or enter scores above</span>
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-state-content">
          <Filter size={48} class="empty-icon" />
          <p>Select a term and class</p>
          <span class="empty-hint">Choose filters above to load results</span>
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

  .results-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .results-wrapper {
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

  .summary-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.625rem;
    background: #eff6ff;
    color: #2563eb;
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
    gap: 1rem;
  }

  .filter-group {
    flex: 1;
    min-width: 180px;
  }

  .filter-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
    color: #64748b;
  }

  /* Table */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
  }

  .results-table {
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    border-collapse: collapse;
  }

  .results-table thead {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .results-table th {
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .results-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .result-row:hover td {
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
    font-size: 0.75rem;
    font-weight: 600;
  }

  .student-link {
    font-weight: 500;
    color: #2563eb;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .student-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .subject-name {
    color: #475569;
    font-weight: 500;
  }

  /* Score Inputs */
  .score-cell {
    width: 110px;
  }

  .score-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    position: relative;
  }

  .score-input {
    width: 70px;
    padding: 0.375rem 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    text-align: center;
    transition: all 0.15s ease;
  }

  .score-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .score-max {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  .saving-icon {
    position: absolute;
    right: -1rem;
    color: #10b981;
  }

  /* Total Score */
  .total-cell {
    font-weight: 600;
    width: 80px;
  }

  .total-score {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-weight: 700;
  }

  .score-excellent {
    background: #ecfdf5;
    color: #065f46;
  }

  .score-good {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .score-average {
    background: #fffbeb;
    color: #92400e;
  }

  .score-poor {
    background: #fef2f2;
    color: #991b1b;
  }

  /* Grade Badge */
  .grade-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
  }

  .grade-A {
    background: #ecfdf5;
    color: #065f46;
  }

  .grade-B {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .grade-C {
    background: #fffbeb;
    color: #92400e;
  }

  .grade-D,
  .grade-E {
    background: #fef2f2;
    color: #991b1b;
  }

  /* Empty State */
  .empty-state {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    text-align: center;
    padding: 3rem;
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

  /* Spinner */
  .spinning {
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .results-container {
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

    .filters-body {
      flex-direction: column;
    }

    .filter-group {
      width: 100%;
    }

    .results-table th,
    .results-table td {
      padding: 0.5rem;
    }

    .score-input {
      width: 60px;
      font-size: 0.75rem;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .results-container {
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
    .table-wrapper,
    .empty-state {
      background: #1e293b;
      border-color: #334155;
    }

    .summary-value {
      color: #f8fafc;
    }

    .summary-icon {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .filter-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .filter-select:focus {
      border-color: #3b82f6;
    }

    .results-table thead {
      background: #0f172a;
      border-bottom-color: #334155;
    }

    .results-table th {
      color: #94a3b8;
    }

    .results-table td {
      border-bottom-color: #334155;
    }

    .result-row:hover td {
      background: #0f172a;
    }

    .student-avatar {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .subject-name {
      color: #cbd5e1;
    }

    .score-input {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .score-input:focus {
      border-color: #3b82f6;
    }

    .score-excellent {
      background: #064e3b;
      color: #6ee7b7;
    }

    .score-good {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .score-average {
      background: #78350f;
      color: #fde68a;
    }

    .score-poor {
      background: #7f1d1d;
      color: #fecaca;
    }

    .grade-A {
      background: #064e3b;
      color: #6ee7b7;
    }

    .grade-B {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .grade-C {
      background: #78350f;
      color: #fde68a;
    }

    .grade-D,
    .grade-E {
      background: #7f1d1d;
      color: #fecaca;
    }

    .empty-icon {
      color: #475569;
    }
  }
</style>