<!-- src/routes/(app)/results/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { 
    BarChart3, BookOpen, Users, Filter, Save, 
    TrendingUp, Award, CheckCircle, AlertCircle,
    Loader2, Edit2, Eye, Download, Printer,
    Search, ChevronDown, X, Upload, FileSpreadsheet,
    User, GraduationCap, Clock, Target, Trophy
  } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let selectedClass   = $state('');
  let selectedTerm    = $state(data.currentTerm?.id ?? '');
  let selectedSubject = $state('');
  let students        = $state<any[]>([]);
  let loading         = $state(false);
  let saving          = $state<Record<string, boolean>>({});
  let selectedStudent = $state<any>(null);
  let showStudentModal = $state(false);
  let showBulkUpload = $state(false);
  let bulkData = $state('');
  let bulkUploading = $state(false);

  // Dropdown states
  let termDropdownOpen = $state(false);
  let classDropdownOpen = $state(false);
  let subjectDropdownOpen = $state(false);
  
  let termSearch = $state('');
  let classSearch = $state('');
  let subjectSearch = $state('');

  // Helper function to get term display name
  function getTermDisplayName(term: any): string {
    if (term.term) {
      const termMap: Record<string, string> = {
        'FIRST': 'First Term',
        'SECOND': 'Second Term',
        'THIRD': 'Third Term'
      };
      return termMap[term.term] || term.term;
    }
    return term.name || 'Unknown Term';
  }

  // Get selected items labels
  let selectedTermLabel = $derived(() => {
    const term = data.terms?.find(t => t.id === selectedTerm);
    return term ? getTermDisplayName(term) : 'Select term…';
  });
  
  let selectedClassLabel = $derived(() => {
    const classItem = data.classes?.find(c => c.id === selectedClass);
    return classItem?.name || 'Select class…';
  });
  
  let selectedSubjectLabel = $derived(() => {
    if (selectedSubject === '') return 'All subjects';
    const subject = data.subjects?.find(s => s.id === selectedSubject);
    return subject?.name || 'Select subject…';
  });

  // Filtered lists
  let filteredTerms = $derived(() => {
    if (!data.terms) return [];
    return data.terms.filter(t => {
      const displayName = getTermDisplayName(t);
      return displayName.toLowerCase().includes(termSearch.toLowerCase());
    });
  });
  
  let filteredClasses = $derived(() => {
    if (!data.classes) return [];
    return data.classes.filter(c => 
      c.name?.toLowerCase().includes(classSearch.toLowerCase())
    );
  });
  
  let filteredSubjects = $derived(() => {
    if (!data.subjects) return [];
    return data.subjects.filter(s => 
      s.name?.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  });

  async function loadStudents() {
    if (!selectedClass || !selectedTerm) return;
    loading = true;
    try {
      const res = await fetch(`/api/results?classId=${selectedClass}&termId=${selectedTerm}&subjectId=${selectedSubject}`);
      const json = await res.json();
      students = json.data ?? [];
    } catch (error) {
      console.error('Failed to load students:', error);
      students = [];
    } finally {
      loading = false;
    }
  }

  async function saveScore(resultId: string | null, studentId: string, subjectId: string, field: string, value: string) {
    const key = `${studentId}-${subjectId}-${field}`;
    saving[key] = true;
    
    try {
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
      
      await loadStudents();
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      saving[key] = false;
    }
  }

  async function uploadBulkResults() {
    if (!bulkData.trim()) return;
    bulkUploading = true;
    
    try {
      // Parse CSV/TSV data
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split('\t');
      const results = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const record: any = {};
        headers.forEach((header, idx) => {
          record[header.trim()] = values[idx]?.trim();
        });
        results.push(record);
      }
      
      await fetch('/api/results/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          termId: selectedTerm,
          subjectId: selectedSubject,
          results
        }),
      });
      
      await loadStudents();
      showBulkUpload = false;
      bulkData = '';
    } catch (error) {
      console.error('Failed to upload bulk results:', error);
    } finally {
      bulkUploading = false;
    }
  }

  function viewStudent(student: any) {
    selectedStudent = student;
    showStudentModal = true;
  }

  function closeModal() {
    showStudentModal = false;
    selectedStudent = null;
  }

  function calculateTotal(row: any) {
    const ca1 = row.ca1Score || 0;
    const ca2 = row.ca2Score || 0;
    const assignment = row.assignmentScore || 0;
    const exam = row.examScore || 0;
    return ca1 + ca2 + assignment + exam;
  }

  function getGrade(score: number) {
    if (score >= 75) return { grade: 'A1', color: 'grade-A' };
    if (score >= 70) return { grade: 'B2', color: 'grade-B' };
    if (score >= 65) return { grade: 'B3', color: 'grade-B' };
    if (score >= 60) return { grade: 'C4', color: 'grade-C' };
    if (score >= 55) return { grade: 'C5', color: 'grade-C' };
    if (score >= 50) return { grade: 'C6', color: 'grade-C' };
    if (score >= 45) return { grade: 'D7', color: 'grade-D' };
    if (score >= 40) return { grade: 'E8', color: 'grade-E' };
    return { grade: 'F9', color: 'grade-F' };
  }

  function getScoreColor(score: number, max: number) {
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

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      termDropdownOpen = false;
      classDropdownOpen = false;
      subjectDropdownOpen = false;
    }
  }

  function selectTerm(termId: string) {
    selectedTerm = termId;
    termDropdownOpen = false;
    termSearch = '';
    loadStudents();
  }

  function selectClass(classId: string) {
    selectedClass = classId;
    classDropdownOpen = false;
    classSearch = '';
    loadStudents();
  }

  function selectSubject(subjectId: string) {
    selectedSubject = subjectId;
    subjectDropdownOpen = false;
    subjectSearch = '';
    loadStudents();
  }

  function clearSubject() {
    selectedSubject = '';
    subjectDropdownOpen = false;
    subjectSearch = '';
    loadStudents();
  }

  // Student performance stats for modal
  const studentPerformance = $derived(() => {
    if (!selectedStudent) return null;
    const studentResults = students.filter(s => s.studentId === selectedStudent.id);
    const subjects = studentResults.map(r => ({
      name: r.subjectName,
      ca1: r.ca1Score || 0,
      ca2: r.ca2Score || 0,
      assignment: r.assignmentScore || 0,
      exam: r.examScore || 0,
      total: r.totalScore || 0,
      grade: r.grade
    }));
    
    const totalScore = subjects.reduce((sum, s) => sum + s.total, 0);
    const average = subjects.length > 0 ? (totalScore / subjects.length).toFixed(1) : 0;
    const bestSubject = subjects.reduce((best, s) => s.total > best.total ? s : best, subjects[0] || { name: '—', total: 0 });
    
    return { subjects, average, bestSubject, totalSubjects: subjects.length };
  });
</script>

<svelte:head>
  <title>Results — LSAI</title>
</svelte:head>

<div class="results-container" onclick={handleClickOutside}>
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
      <div class="header-actions">
        <button onclick={() => showBulkUpload = true} class="bulk-upload-btn">
          <Upload size={16} />
          Bulk Upload
        </button>
        <button onclick={() => window.print()} class="print-btn">
          <Printer size={16} />
          Print
        </button>
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
          <div class="custom-dropdown" class:open={termDropdownOpen}>
            <button type="button" class="dropdown-trigger" onclick={(e) => { e.stopPropagation(); termDropdownOpen = !termDropdownOpen; }}>
              <span class="dropdown-value">{selectedTermLabel()}</span>
              <ChevronDown size={16} class="dropdown-icon" />
            </button>
            {#if termDropdownOpen}
              <div class="dropdown-menu">
                <div class="dropdown-search">
                  <Search size={14} />
                  <input type="text" placeholder="Search term..." bind:value={termSearch} onclick={(e) => e.stopPropagation()} />
                </div>
                <div class="dropdown-options">
                  {#each filteredTerms() as term}
                    <div class="dropdown-option {selectedTerm === term.id ? 'selected' : ''}" onclick={() => selectTerm(term.id)}>
                      {getTermDisplayName(term)}
                    </div>
                  {:else}
                    <div class="dropdown-empty">No terms found</div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Class *</label>
          <div class="custom-dropdown" class:open={classDropdownOpen}>
            <button type="button" class="dropdown-trigger" onclick={(e) => { e.stopPropagation(); classDropdownOpen = !classDropdownOpen; }}>
              <span class="dropdown-value">{selectedClassLabel()}</span>
              <ChevronDown size={16} class="dropdown-icon" />
            </button>
            {#if classDropdownOpen}
              <div class="dropdown-menu">
                <div class="dropdown-search">
                  <Search size={14} />
                  <input type="text" placeholder="Search class..." bind:value={classSearch} onclick={(e) => e.stopPropagation()} />
                </div>
                <div class="dropdown-options">
                  {#each filteredClasses() as cls}
                    <div class="dropdown-option {selectedClass === cls.id ? 'selected' : ''}" onclick={() => selectClass(cls.id)}>
                      {cls.name}
                    </div>
                  {:else}
                    <div class="dropdown-empty">No classes found</div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Subject</label>
          <div class="custom-dropdown" class:open={subjectDropdownOpen}>
            <button type="button" class="dropdown-trigger" onclick={(e) => { e.stopPropagation(); subjectDropdownOpen = !subjectDropdownOpen; }}>
              <span class="dropdown-value">{selectedSubjectLabel()}</span>
              {#if selectedSubject}
                <button class="dropdown-clear" onclick={(e) => { e.stopPropagation(); clearSubject(); }} aria-label="Clear subject">
                  <X size={14} />
                </button>
              {/if}
              <ChevronDown size={16} class="dropdown-icon" />
            </button>
            {#if subjectDropdownOpen}
              <div class="dropdown-menu">
                <div class="dropdown-search">
                  <Search size={14} />
                  <input type="text" placeholder="Search subject..." bind:value={subjectSearch} onclick={(e) => e.stopPropagation()} />
                </div>
                <div class="dropdown-options">
                  <div class="dropdown-option {selectedSubject === '' ? 'selected' : ''}" onclick={() => selectSubject('')}>All subjects</div>
                  {#each filteredSubjects() as sub}
                    <div class="dropdown-option {selectedSubject === sub.id ? 'selected' : ''}" onclick={() => selectSubject(sub.id)}>
                      {sub.name}
                    </div>
                  {:else}
                    <div class="dropdown-empty">No subjects found</div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
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
              <th>CA1 (15)</th>
              <th>CA2 (15)</th>
              <th>ASS (10)</th>
              <th>Exam (60)</th>
              <th>Total</th>
              <th>Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each students as row}
              {@const total = calculateTotal(row)}
              {@const gradeInfo = getGrade(total)}
              <tr class="result-row">
                <td class="student-cell">
                  <div class="student-info" onclick={() => viewStudent(row)} style="cursor: pointer;">
                    <div class="student-avatar">{row.studentName?.charAt(0) || 'S'}</div>
                    <span class="student-name">{row.studentName}</span>
                  </div>
                </td>
                <td class="subject-name">{row.subjectName}</td>
                <td class="score-cell">
                  <input type="number" min="0" max="15" value={row.ca1Score ?? 0}
                    onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'ca1Score', e.target.value)}
                    class="score-input ca-input" />
                </td>
                <td class="score-cell">
                  <input type="number" min="0" max="15" value={row.ca2Score ?? 0}
                    onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'ca2Score', e.target.value)}
                    class="score-input ca-input" />
                </td>
                <td class="score-cell">
                  <input type="number" min="0" max="10" value={row.assignmentScore ?? 0}
                    onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'assignmentScore', e.target.value)}
                    class="score-input ass-input" />
                </td>
                <td class="score-cell">
                  <input type="number" min="0" max="60" value={row.examScore ?? 0}
                    onblur={e => saveScore(row.id, row.studentId, row.subjectId, 'examScore', e.target.value)}
                    class="score-input exam-input" />
                </td>
                <td class="total-cell">
                  <span class="total-score {getScoreColor(total, 100)}">{total}</span>
                </td>
                <td class="grade-cell">
                  <span class="grade-badge {gradeInfo.color}">{gradeInfo.grade}</span>
                </td>
                <td class="action-cell">
                  <button onclick={() => viewStudent(row)} class="view-student-btn" title="View Performance">
                    <Eye size={16} />
                  </button>
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

<!-- Student Performance Modal -->
{#if showStudentModal && selectedStudent}
  <div class="modal-overlay" onclick={closeModal}>
    <div class="modal-container" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <div class="modal-title-section">
          <div class="student-avatar-large">
            {selectedStudent.studentName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 class="modal-title">{selectedStudent.studentName}</h2>
            <p class="modal-subtitle">{selectedStudent.admissionNo} · {selectedStudent.className}</p>
          </div>
        </div>
        <button onclick={closeModal} class="modal-close">
          <X size={20} />
        </button>
      </div>

      {#if studentPerformance()}
        {@const perf = studentPerformance()}
        <div class="modal-body">
          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-card">
              <Trophy size={20} />
              <div>
                <p class="stat-label">Average Score</p>
                <p class="stat-number">{perf.average}%</p>
              </div>
            </div>
            <div class="stat-card">
              <BookOpen size={20} />
              <div>
                <p class="stat-label">Subjects</p>
                <p class="stat-number">{perf.totalSubjects}</p>
              </div>
            </div>
            <div class="stat-card">
              <Award size={20} />
              <div>
                <p class="stat-label">Best Subject</p>
                <p class="stat-number">{perf.bestSubject.name}</p>
                <p class="stat-small">{perf.bestSubject.total}%</p>
              </div>
            </div>
          </div>

          <!-- Subjects Performance Table -->
          <div class="subjects-performance">
            <h3 class="section-title">Subject Performance</h3>
            <div class="subjects-table-wrapper">
              <table class="subjects-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA1 (15)</th>
                    <th>CA2 (15)</th>
                    <th>ASS (10)</th>
                    <th>Exam (60)</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {#each perf.subjects as subject}
                    <tr>
                      <td class="subject-name-cell">{subject.name}</td>
                      <td class="score-cell">{subject.ca1}</td>
                      <td class="score-cell">{subject.ca2}</td>
                      <td class="score-cell">{subject.assignment}</td>
                      <td class="score-cell">{subject.exam}</td>
                      <td class="total-cell">{subject.total}</td>
                      <td class="grade-cell">
                        <span class="grade-badge-small {getGrade(subject.total).color}">
                          {getGrade(subject.total).grade}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Bulk Upload Modal -->
{#if showBulkUpload}
  <div class="modal-overlay" onclick={() => showBulkUpload = false}>
    <div class="modal-container bulk-modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <div class="modal-title-section">
          <Upload size={20} />
          <h2 class="modal-title">Bulk Upload Results</h2>
        </div>
        <button onclick={() => showBulkUpload = false} class="modal-close">
          <X size={20} />
        </button>
      </div>

      <div class="modal-body">
        <div class="bulk-info">
          <FileSpreadsheet size={40} />
          <p>Upload results using CSV/TSV format with the following columns:</p>
          <pre class="format-example">
Student Name	Subject	CA1	CA2	ASS	Exam
John Doe	Mathematics	12	14	8	52
Jane Smith	English	13	12	9	48</pre>
          <p class="format-note">Use tab-separated values (TSV) or comma-separated (CSV)</p>
        </div>

        <textarea class="bulk-textarea" placeholder="Paste your data here..." bind:value={bulkData} rows={10}></textarea>

        <div class="bulk-actions">
          <button onclick={() => showBulkUpload = false} class="cancel-btn">Cancel</button>
          <button onclick={uploadBulkResults} disabled={bulkUploading || !bulkData.trim()} class="upload-submit-btn">
            {#if bulkUploading}
              <Loader2 size={16} class="spinning" />
              Uploading...
            {:else}
              <Upload size={16} />
              Upload Results
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

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
    max-width: 90rem;
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

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .bulk-upload-btn, .print-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .bulk-upload-btn:hover, .print-btn:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
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
    min-width: 200px;
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

  /* Custom Dropdown Styles */
  .custom-dropdown {
    position: relative;
    width: 100%;
  }

  .dropdown-trigger {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    transition: all 0.15s ease;
  }

  .dropdown-trigger:hover {
    border-color: #94a3b8;
  }

  .custom-dropdown.open .dropdown-trigger {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .dropdown-value {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-icon {
    flex-shrink: 0;
    color: #94a3b8;
    transition: transform 0.15s ease;
  }

  .custom-dropdown.open .dropdown-icon {
    transform: rotate(180deg);
  }

  .dropdown-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.15s ease;
  }

  .dropdown-clear:hover {
    color: #ef4444;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 50;
    overflow: hidden;
  }

  .dropdown-search {
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
  }

  .dropdown-search input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;
    background: transparent;
  }

  .dropdown-options {
    max-height: 240px;
    overflow-y: auto;
  }

  .dropdown-option {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #0f172a;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .dropdown-option:hover {
    background: #f1f5f9;
  }

  .dropdown-option.selected {
    background: #eff6ff;
    color: #2563eb;
  }

  .dropdown-empty {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #94a3b8;
    text-align: center;
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

  .student-cell {
    cursor: pointer;
  }

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

  .student-name {
    font-weight: 500;
    color: #0f172a;
  }

  .subject-name {
    color: #475569;
    font-weight: 500;
  }

  /* Score Inputs */
  .score-cell {
    width: 85px;
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

  .ca-input { border-left: 3px solid #3b82f6; }
  .ass-input { border-left: 3px solid #10b981; }
  .exam-input { border-left: 3px solid #ef4444; }

  .total-cell {
    font-weight: 600;
    width: 70px;
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
    min-width: 45px;
    text-align: center;
  }

  .grade-A, .grade-A1 { background: #ecfdf5; color: #065f46; }
  .grade-B, .grade-B2, .grade-B3 { background: #eff6ff; color: #1d4ed8; }
  .grade-C, .grade-C4, .grade-C5, .grade-C6 { background: #fffbeb; color: #92400e; }
  .grade-D, .grade-D7, .grade-E, .grade-E8 { background: #fef2f2; color: #991b1b; }
  .grade-F, .grade-F9 { background: #fef2f2; color: #dc2626; }

  .action-cell {
    width: 50px;
  }

  .view-student-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    background: transparent;
    color: #2563eb;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .view-student-btn:hover {
    background: #eff6ff;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-container {
    background: white;
    border-radius: 1rem;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.2s ease-out;
  }

  .modal-container.bulk-modal {
    max-width: 600px;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .student-avatar-large {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #dbeafe;
    color: #1d4ed8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
  }

  .modal-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.125rem;
  }

  .modal-close {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    color: #64748b;
    transition: all 0.15s ease;
  }

  .modal-close:hover {
    background: #e2e8f0;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  /* Quick Stats */
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }

  .stat-card svg {
    color: #2563eb;
  }

  .stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }

  .stat-number {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
  }

  .stat-small {
    font-size: 0.7rem;
    color: #64748b;
  }

  /* Subjects Performance Table */
  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .subjects-table-wrapper {
    overflow-x: auto;
  }

  .subjects-table {
    width: 100%;
    font-size: 0.875rem;
    border-collapse: collapse;
  }

  .subjects-table th {
    padding: 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }

  .subjects-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .subject-name-cell {
    font-weight: 500;
    color: #0f172a;
  }

  .grade-badge-small {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 35px;
    text-align: center;
  }

  /* Bulk Upload */
  .bulk-info {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .bulk-info svg {
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  .format-example {
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.7rem;
    font-family: monospace;
    margin: 0.75rem 0;
    overflow-x: auto;
  }

  .format-note {
    font-size: 0.7rem;
    color: #94a3b8;
  }

  .bulk-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-family: monospace;
    resize: vertical;
  }

  .bulk-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .bulk-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cancel-btn:hover {
    background: #f8fafc;
  }

  .upload-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .upload-submit-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .upload-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    to { transform: rotate(360deg); }
  }

  /* Responsive */
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
      width: 55px;
      font-size: 0.7rem;
    }

    .quick-stats {
      grid-template-columns: 1fr;
    }

    .modal-container {
      margin: 1rem;
      max-height: 95vh;
    }
  }

  /* Dark Mode */
  :global(.dark) .results-container {
    background: #0f172a;
  }

  :global(.dark) .page-title {
    color: #f8fafc;
  }

  :global(.dark) .title-icon {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  :global(.dark) .summary-card,
  :global(.dark) .filters-card,
  :global(.dark) .table-wrapper,
  :global(.dark) .empty-state,
  :global(.dark) .modal-container {
    background: #1e293b;
    border-color: #334155;
  }

  :global(.dark) .summary-value {
    color: #f8fafc;
  }

  :global(.dark) .summary-icon {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .dropdown-trigger {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .dropdown-menu {
    background: #1e293b;
    border-color: #475569;
  }

  :global(.dark) .dropdown-option {
    color: #cbd5e1;
  }

  :global(.dark) .dropdown-option:hover {
    background: #334155;
  }

  :global(.dark) .dropdown-option.selected {
    background: #1e2d4a;
    color: #93c5fd;
  }

  :global(.dark) .results-table thead {
    background: #0f172a;
    border-bottom-color: #334155;
  }

  :global(.dark) .results-table th {
    color: #94a3b8;
  }

  :global(.dark) .results-table td {
    border-bottom-color: #334155;
  }

  :global(.dark) .result-row:hover td {
    background: #0f172a;
  }

  :global(.dark) .student-name {
    color: #f8fafc;
  }

  :global(.dark) .subject-name {
    color: #cbd5e1;
  }

  :global(.dark) .score-input {
    background: #1e293b;
    border-color: #475569;
    color: #f8fafc;
  }

  :global(.dark) .stat-card {
    background: #0f172a;
  }

  :global(.dark) .stat-number {
    color: #f8fafc;
  }

  :global(.dark) .section-title {
    color: #f8fafc;
  }

  :global(.dark) .subject-name-cell {
    color: #f8fafc;
  }
</style>