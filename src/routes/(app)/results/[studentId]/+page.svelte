<!-- src/routes/(app)/results/[studentId]/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { 
    ArrowLeft, GraduationCap, Award, BarChart3, 
    BookOpen, TrendingUp, FileText, CheckCircle,
    AlertCircle, Calendar, User, Download, Printer
  } from 'lucide-svelte';
  
  let { data }: { data: PageData } = $props();

  function changeTerm(e: Event) {
    const termId = (e.target as HTMLSelectElement).value;
    goto(`?term=${termId}`);
  }

  const gradeColor: Record<string, string> = {
    A1: 'badge-green', B2: 'badge-green', B3: 'badge-green',
    C4: 'badge-blue',  C5: 'badge-blue',  C6: 'badge-blue',
    D7: 'badge-yellow',E8: 'badge-yellow',F9: 'badge-red',
    A:  'badge-green', B: 'badge-blue',   C: 'badge-yellow', F: 'badge-red',
  };

  const gradeIcon: Record<string, any> = {
    A1: Award, B2: Award, B3: Award,
    C4: CheckCircle, C5: CheckCircle, C6: CheckCircle,
    D7: AlertCircle, E8: AlertCircle, F9: AlertCircle,
    A: Award, B: CheckCircle, C: AlertCircle, F: AlertCircle
  };

  // Calculate performance statistics
  const performanceStats = $derived({
    totalSubjects: data.results.length,
    passedSubjects: data.results.filter(r => {
      const grade = r.grade || '';
      return !['F9', 'F', 'D7', 'E8'].includes(grade);
    }).length,
    distinctionCount: data.results.filter(r => ['A1', 'A'].includes(r.grade || '')).length,
    creditCount: data.results.filter(r => ['B2', 'B3', 'B', 'C4', 'C5', 'C6'].includes(r.grade || '')).length,
    bestSubject: data.results.reduce((best, current) => 
      (current.totalScore || 0) > (best?.totalScore || 0) ? current : best, data.results[0]
    ),
    passRate: data.results.length > 0 
      ? ((data.results.filter(r => {
          const grade = r.grade || '';
          return !['F9', 'F'].includes(grade);
        }).length / data.results.length) * 100).toFixed(1)
      : 0
  });
</script>

<svelte:head>
  <title>{data.student.firstName} {data.student.lastName} Results — SMS</title>
</svelte:head>

<div class="results-detail-container">
  <div class="results-detail-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <h1 class="page-title">{data.student.firstName} {data.student.lastName}</h1>
          <p class="page-subtitle">
            {data.student.admissionNo} · {data.student.class?.name ?? '—'}
          </p>
        </div>
      </div>
      <a href="/students/{data.student.id}" class="back-btn">
        <ArrowLeft size={16} />
        Profile
      </a>
    </div>

    <!-- Performance Summary Cards -->
    {#if data.results.length > 0}
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">
            <BarChart3 size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Average Score</p>
            <p class="summary-value">{data.avgScore}%</p>
            <p class="summary-trend">Overall average</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <BookOpen size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Subjects</p>
            <p class="summary-value">{performanceStats.totalSubjects}</p>
            <p class="summary-trend">
              {performanceStats.passedSubjects} passed
            </p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <Award size={20} />
          </div>
          <div class="summary-info">
            <p class="summary-label">Pass Rate</p>
            <p class="summary-value">{performanceStats.passRate}%</p>
            <p class="summary-trend">
              {performanceStats.distinctionCount} distinctions
            </p>
          </div>
        </div>
        
        {#if performanceStats.bestSubject}
          <div class="summary-card">
            <div class="summary-icon">
              <TrendingUp size={20} />
            </div>
            <div class="summary-info">
              <p class="summary-label">Best Subject</p>
              <p class="summary-value">{performanceStats.bestSubject.subject.name}</p>
              <p class="summary-trend">{performanceStats.bestSubject.totalScore}% ({performanceStats.bestSubject.grade})</p>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Term Selection and Info -->
    <div class="term-section">
      <div class="term-selector">
        <Calendar size={16} />
        <select onchange={changeTerm} class="term-select">
          {#each data.terms as term}
            <option value={term.id} selected={term.id === data.selectedTermId}>
              {term.name}
            </option>
          {/each}
        </select>
      </div>
      
      {#if data.avgScore}
        <div class="score-summary">
          <TrendingUp size={16} />
          <span>Average: <strong>{data.avgScore}%</strong></span>
        </div>
      {/if}
    </div>

    <!-- Results Table -->
    <div class="table-wrapper">
      <table class="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject</th>
            <th>CA (40)</th>
            <th>Exam (60)</th>
            <th>Total</th>
            <th>Grade</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {#each data.results as result, i}
            <tr class="result-row">
              <td class="row-number">{i + 1}</td>
              <td class="subject-cell">
                <div class="subject-info">
                  <BookOpen size={14} />
                  <span class="subject-name">{result.subject.name}</span>
                </div>
              </td>
              <td class="score-cell ca-score">{result.caScore ?? '—'}</td>
              <td class="score-cell exam-score">{result.examScore ?? '—'}</td>
              <td class="total-cell">{result.totalScore ?? '—'}</td>
              <td class="grade-cell">
                {#if result.grade}
                  {@const Icon = gradeIcon[result.grade] || Award}
                  <span class="grade-badge {gradeColor[result.grade] ?? 'badge-gray'}">
                    <Icon size={12} />
                    {result.grade}
                  </span>
                {:else}
                  <span class="grade-badge badge-gray">—</span>
                {/if}
              </td>
              <td class="remark-cell">{result.remark ?? '—'}</td>
            </tr>
          {:else}
            <tr class="empty-row">
              <td colspan="7" class="empty-state">
                <div class="empty-state-content">
                  <FileText size={48} class="empty-icon" />
                  <p>No results for this term</p>
                  <span class="empty-hint">Results will appear here once entered</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
       </table>
    </div>

    <!-- Performance Legend -->
    {#if data.results.length > 0}
      <div class="legend">
        <p class="legend-title">Grade Legend</p>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-badge badge-green"></span>
            <span>Distinction (A1-A, 75-100%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-blue"></span>
            <span>Credit (B2-C6, 50-74%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-yellow"></span>
            <span>Pass (D7-E8, 40-49%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-red"></span>
            <span>Fail (F9-F, 0-39%)</span>
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

  .results-detail-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .results-detail-wrapper {
    max-width: 56rem;
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

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    color: #475569;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .back-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateX(-2px);
  }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
    margin-bottom: 0.125rem;
  }

  .summary-trend {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  /* Term Section */
  .term-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .term-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
  }

  .term-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    min-width: 160px;
  }

  .term-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .score-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ecfdf5;
    border-radius: 0.5rem;
    color: #065f46;
    font-size: 0.875rem;
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
  }

  .results-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .result-row:hover td {
    background: #f8fafc;
  }

  .row-number {
    color: #94a3b8;
    width: 50px;
  }

  .subject-cell {
    width: 200px;
  }

  .subject-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .subject-name {
    font-weight: 500;
    color: #0f172a;
  }

  .score-cell {
    font-weight: 500;
    width: 80px;
  }

  .ca-score {
    color: #2563eb;
  }

  .exam-score {
    color: #7c3aed;
  }

  .total-cell {
    font-weight: 700;
    font-size: 1rem;
    color: #0f172a;
    width: 70px;
  }

  .grade-cell {
    width: 100px;
  }

  .grade-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-green {
    background: #ecfdf5;
    color: #065f46;
  }

  .badge-blue {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .badge-yellow {
    background: #fffbeb;
    color: #92400e;
  }

  .badge-red {
    background: #fef2f2;
    color: #991b1b;
  }

  .badge-gray {
    background: #f1f5f9;
    color: #475569;
  }

  .remark-cell {
    color: #64748b;
    font-size: 0.8125rem;
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

  /* Legend */
  .legend {
    margin-top: 1.5rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
  }

  .legend-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #475569;
  }

  .legend-badge {
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .results-detail-container {
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
      gap: 0.75rem;
    }

    .term-section {
      flex-direction: column;
      align-items: stretch;
    }

    .term-select {
      width: 100%;
    }

    .score-summary {
      justify-content: center;
    }

    .results-table th,
    .results-table td {
      padding: 0.5rem;
    }

    .subject-cell {
      width: auto;
    }

    .legend-items {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .results-detail-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .back-btn {
      background: #1e293b;
      border-color: #334155;
      color: #cbd5e1;
    }

    .back-btn:hover {
      background: #334155;
    }

    .summary-card,
    .table-wrapper,
    .legend {
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

    .term-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .term-select:focus {
      border-color: #3b82f6;
    }

    .score-summary {
      background: #064e3b;
      color: #6ee7b7;
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

    .subject-name {
      color: #f8fafc;
    }

    .total-cell {
      color: #f8fafc;
    }

    .badge-green {
      background: #064e3b;
      color: #6ee7b7;
    }

    .badge-blue {
      background: #1e2d4a;
      color: #93c5fd;
    }

    .badge-yellow {
      background: #78350f;
      color: #fde68a;
    }

    .badge-red {
      background: #7f1d1d;
      color: #fecaca;
    }

    .empty-icon {
      color: #475569;
    }

    .legend-item {
      color: #cbd5e1;
    }
  }
</style>