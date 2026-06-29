<!-- src/routes/results/+page.svelte -->
<!-- Public result checker — students enter admission no + scratch card PIN -->
<script lang="ts">
  import { Search, Printer, AlertCircle, BookOpen, ChevronDown, CreditCard, Info } from 'lucide-svelte';

  // ── State ──────────────────────────────────────────────────────────────────
  let admissionNo = $state('');
  let pin         = $state('');
  let termId      = $state('');
  let loading     = $state(false);
  let error       = $state('');

  let result: any  = $state(null);
  let allTerms: any[] = $state([]);

  // PIN formatting — group into 4-4-4
  let pinDisplay = $state('');
  function onPinInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 12);
    pin        = raw;
    pinDisplay = raw.match(/.{1,4}/g)?.join('-') ?? raw;
  }

  function ordinal(n: number) {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  // ── Check result ───────────────────────────────────────────────────────────
  async function checkResult() {
    if (!admissionNo.trim() || !pin.trim()) {
      error = 'Please enter your admission number and PIN.';
      return;
    }
    loading = true;
    error   = '';
    result  = null;

    try {
      const res = await fetch('/api/results/check', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ admissionNo: admissionNo.trim(), pin: pin.trim(), termId: termId || undefined }),
      });
      const data = await res.json();

      if (!data.success) {
        error = data.error ?? 'Something went wrong. Please try again.';
      } else {
        result   = data;
        allTerms = data.allTerms ?? [];
      }
    } catch {
      error = 'Network error. Please check your connection and try again.';
    } finally {
      loading = false;
    }
  }

  // Re-check a different term
  async function switchTerm(newTermId: string) {
    termId = newTermId;
    await checkResult();
  }

  // ── Grade colour ───────────────────────────────────────────────────────────
  function gradeClass(grade: string | null): string {
    if (!grade) return 'gr-default';
    if (['A1','A','E'].includes(grade))            return 'gr-excellent';
    if (['B2','B3','B','VG'].includes(grade))       return 'gr-good';
    if (['C4','C5','C6','C','G','S'].includes(grade)) return 'gr-average';
    if (['D7','D'].includes(grade))                return 'gr-pass';
    return 'gr-fail';
  }

  function printResult() { window.print(); }

  const TERM_LABELS: Record<string, string> = {
    FIRST: 'First Term', SECOND: 'Second Term', THIRD: 'Third Term',
  };
</script>

<svelte:head>
  <title>Result Checker — School Management System</title>
</svelte:head>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────────────── -->
  <header class="site-header no-print">
    <div class="header-inner">
      <div class="school-brand">
        <div class="school-logo">
          <BookOpen size={22} />
        </div>
        <div>
          <p class="school-name">School Management System</p>
          <p class="school-tag">Student Result Portal</p>
        </div>
      </div>
      <nav class="header-nav">
        <a href="/login">Staff Login</a>
      </nav>
    </div>
  </header>

  <main class="main">

    <!-- ── Check form ──────────────────────────────────────────────────────── -->
    {#if !result}
      <div class="checker-wrap no-print">
        <div class="checker-card">
          <div class="checker-top">
            <div class="checker-icon-wrap">
              <CreditCard size={28} />
            </div>
            <h1>Check Your Result</h1>
            <p>Enter your admission number and scratch card PIN to view your result.</p>
          </div>

          {#if error}
            <div class="alert alert-error">
              <AlertCircle size={16} />
              {error}
            </div>
          {/if}

          <div class="form">
            <div class="field">
              <label for="admissionNo">Admission / Registration Number</label>
              <input
                id="admissionNo"
                type="text"
                bind:value={admissionNo}
                placeholder="e.g. SMS/2024/0001"
                autocomplete="off"
                spellcheck="false"
                onkeydown={(e) => e.key === 'Enter' && checkResult()}
              />
            </div>

            <div class="field">
              <label for="pin">Scratch Card PIN</label>
              <input
                id="pin"
                type="text"
                inputmode="numeric"
                value={pinDisplay}
                oninput={onPinInput}
                placeholder="XXXX-XXXX-XXXX"
                autocomplete="off"
                maxlength="14"
                onkeydown={(e) => e.key === 'Enter' && checkResult()}
              />
              <p class="field-hint">Scratch the silver panel on your card to reveal the PIN.</p>
            </div>

            <button class="btn-check" onclick={checkResult} disabled={loading}>
              {#if loading}
                <span class="spinner"></span> Checking…
              {:else}
                <Search size={16} /> Check Result
              {/if}
            </button>
          </div>

          <!-- Demo card hint -->
          <div class="demo-hint">
            <Info size={14} />
            <div>
              <strong>Demo card:</strong>
              Serial <code>SC-DEMO-000001</code> &nbsp;·&nbsp; PIN <code>1234-5678-9012</code>
            </div>
          </div>
        </div>
      </div>

    {:else}
      <!-- ── Result sheet ─────────────────────────────────────────────────── -->

      <!-- Print toolbar -->
      <div class="toolbar no-print">
        <div class="toolbar-left">
          <button class="btn-back" onclick={() => { result = null; pin = ''; pinDisplay = ''; admissionNo = ''; }}>
            ← Check Another
          </button>

          <!-- Term switcher -->
          {#if allTerms.length > 1}
            <div class="term-switcher">
              <ChevronDown size={14} />
              <select onchange={(e) => switchTerm((e.target as HTMLSelectElement).value)}>
                {#each allTerms as t}
                  <option value={t.id} selected={t.id === result.term.id}>{t.label}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
        <button class="btn-print" onclick={printResult}>
          <Printer size={15} /> Print Result
        </button>
      </div>

      <!-- Result sheet (prints cleanly) -->
      <div class="sheet">

        <!-- Sheet header -->
        <div class="sheet-header">
          <div class="sheet-logo">
            <BookOpen size={30} />
          </div>
          <div class="sheet-school">
            <h2>School Management System</h2>
            <p>Student Academic Report Sheet</p>
            <p class="sheet-term">{result.term.label} · {result.term.academicYear}</p>
          </div>
        </div>

        <hr class="divider" />

        <!-- Bio data -->
        <div class="bio">
          <div class="bio-grid">
            <div class="bio-item">
              <span class="bio-label">Full Name</span>
              <span class="bio-value">{result.student.name}</span>
            </div>
            <div class="bio-item">
              <span class="bio-label">Admission No.</span>
              <span class="bio-value">{result.student.admissionNo}</span>
            </div>
            <div class="bio-item">
              <span class="bio-label">Class</span>
              <span class="bio-value">{result.student.class}</span>
            </div>
            <div class="bio-item">
              <span class="bio-label">Gender</span>
              <span class="bio-value">{result.student.gender}</span>
            </div>
          </div>
        </div>

        <!-- Summary row -->
        <div class="summary-row">
          <div class="summary-box">
            <span class="summary-val">{result.summary.totalSubjects}</span>
            <span class="summary-label">Subjects</span>
          </div>
          <div class="summary-box">
            <span class="summary-val">{result.summary.average}%</span>
            <span class="summary-label">Average</span>
          </div>
          <div class="summary-box highlight-pass">
            <span class="summary-val">{result.summary.passed}</span>
            <span class="summary-label">Passed</span>
          </div>
          <div class="summary-box highlight-fail">
            <span class="summary-val">{result.summary.failed}</span>
            <span class="summary-label">Failed</span>
          </div>
          <div class="summary-box highlight-grade">
            <span class="summary-val">{result.summary.overallGrade ?? '—'}</span>
            <span class="summary-label">Best Grade</span>
          </div>
        </div>

        <!-- Results table -->
        {#if result.results.length > 0}
          <table class="result-table">
            <thead>
              <tr>
                <th class="col-no">#</th>
                <th class="col-subject">Subject</th>
                <th class="col-score">CA<br/><small>(40)</small></th>
                <th class="col-score">Exam<br/><small>(60)</small></th>
                <th class="col-score">Total<br/><small>(100)</small></th>
                <th class="col-grade">Grade</th>
                <th class="col-pos">Position</th>
                <th class="col-remark">Remark</th>
              </tr>
            </thead>
            <tbody>
              {#each result.results as row, i}
                <tr class:row-fail={(row.total ?? 0) < 50}>
                  <td class="col-no">{i + 1}</td>
                  <td class="col-subject">{row.subject}</td>
                  <td class="col-score">{row.caScore ?? '—'}</td>
                  <td class="col-score">{row.examScore ?? '—'}</td>
                  <td class="col-score total-cell">{row.total ?? '—'}</td>
                  <td class="col-grade">
                    <span class="grade-badge {gradeClass(row.grade)}">{row.grade ?? '—'}</span>
                  </td>
                  <td class="col-pos">{row.position ? `${row.position}${ordinal(row.position)}` : '—'}</td>
                  <td class="col-remark">{row.remark ?? '—'}</td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="tfoot-label">Total Score</td>
                <td class="col-score total-cell">{result.summary.totalScore}</td>
                <td colspan="3"></td>
              </tr>
              <tr>
                <td colspan="4" class="tfoot-label">Average Score</td>
                <td class="col-score total-cell">{result.summary.average}%</td>
                <td colspan="3"></td>
              </tr>
            </tfoot>
          </table>
        {:else}
          <div class="no-results">
            <AlertCircle size={20} />
            No published results found for this term. Please contact the school office.
          </div>
        {/if}

        <!-- Grade key -->
        <div class="grade-key">
          <p class="grade-key-title">Grading Key</p>
          <div class="grade-key-items">
            <span><b>A1</b> 75–100 Excellent</span>
            <span><b>B2</b> 70–74 Very Good</span>
            <span><b>B3</b> 65–69 Good</span>
            <span><b>C4</b> 60–64 Credit</span>
            <span><b>C5</b> 55–59 Credit</span>
            <span><b>C6</b> 50–54 Credit</span>
            <span><b>D7</b> 45–49 Pass</span>
            <span><b>E8</b> 40–44 Pass</span>
            <span><b>F9</b> 0–39 Fail</span>
          </div>
        </div>

        <!-- Sheet footer -->
        <div class="sheet-footer">
          <div class="sig-block">
            <div class="sig-line"></div>
            <p>Class Teacher</p>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <p>Head Teacher / Principal</p>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <p>School Stamp</p>
          </div>
        </div>
        <p class="sheet-generated">
          Generated: {new Date().toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}
          &nbsp;·&nbsp; Admission No: {result.student.admissionNo}
        </p>

      </div><!-- /sheet -->

    {/if}

  </main>
</div>

<style>
  /* ── Reset & base ──────────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page { min-height: 100vh; background: #f0f4f8; font-family: system-ui, sans-serif; }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  .site-header {
    background: #1e3a5f;
    color: white;
    padding: .875rem 1.5rem;
  }
  .header-inner {
    max-width: 900px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
  }
  .school-brand { display: flex; align-items: center; gap: .75rem; }
  .school-logo {
    width: 2.5rem; height: 2.5rem; border-radius: .5rem;
    background: rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center;
  }
  .school-name { font-weight: 700; font-size: 1rem; }
  .school-tag  { font-size: .75rem; opacity: .7; }
  .header-nav a { color: rgba(255,255,255,.8); font-size: .875rem; text-decoration: none; }
  .header-nav a:hover { color: white; text-decoration: underline; }

  /* ── Main ────────────────────────────────────────────────────────────────── */
  .main { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 4rem; }

  /* ── Checker card ────────────────────────────────────────────────────────── */
  .checker-wrap { display: flex; justify-content: center; }
  .checker-card {
    background: white; border-radius: 1rem; border: 1px solid #dde3ec;
    padding: 2rem; width: 100%; max-width: 26rem;
    box-shadow: 0 4px 24px rgba(0,0,0,.07);
  }
  .checker-top { text-align: center; margin-bottom: 1.5rem; }
  .checker-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    background: #1e3a5f;
    color: white;
    margin-bottom: .75rem;
  }
  .checker-top h1 { font-size: 1.375rem; font-weight: 700; color: #1e293b; }
  .checker-top p  { font-size: .875rem; color: #64748b; margin-top: .35rem; }

  .alert {
    display: flex; align-items: flex-start; gap: .5rem;
    font-size: .875rem; border-radius: .5rem; padding: .75rem 1rem;
    margin-bottom: 1.25rem; line-height: 1.5;
  }
  .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }

  .form { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: .3rem; }
  label  { font-size: .8125rem; font-weight: 600; color: #334155; }

  input[type="text"] {
    width: 100%; padding: .625rem .875rem;
    border: 1px solid #cbd5e1; border-radius: .5rem;
    font-size: .9375rem; color: #0f172a; background: white;
    transition: border-color .15s, box-shadow .15s;
    letter-spacing: .02em;
  }
  input:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,.12); }

  .field-hint { font-size: .75rem; color: #94a3b8; margin-top: .2rem; }

  .btn-check {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: .5rem; background: #1e3a5f; color: white;
    font-size: .9375rem; font-weight: 600;
    padding: .75rem 1rem; border: none; border-radius: .5rem;
    cursor: pointer; margin-top: .25rem;
    transition: background .15s, transform .1s, opacity .15s;
  }
  .btn-check:hover:not(:disabled) { background: #16305a; transform: translateY(-1px); }
  .btn-check:disabled { opacity: .6; cursor: not-allowed; }

  /* Spinner */
  .spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: spin .6s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Demo hint */
  .demo-hint {
    display: flex; align-items: flex-start; gap: .5rem;
    margin-top: 1.25rem; padding: .75rem .875rem;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: .5rem; font-size: .8rem; color: #1d4ed8; line-height: 1.5;
  }
  .demo-hint :global(svg) { flex-shrink: 0; margin-top: 1px; }
  .demo-hint code {
    font-family: ui-monospace, monospace; font-size: .8rem;
    background: #dbeafe; padding: .1rem .3rem; border-radius: .25rem;
  }

  /* ── Toolbar ─────────────────────────────────────────────────────────────── */
  .toolbar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
  }
  .toolbar-left { display: flex; align-items: center; gap: .75rem; }

  .btn-back {
    background: white; border: 1px solid #cbd5e1; color: #334155;
    font-size: .875rem; font-weight: 500; padding: .5rem .875rem;
    border-radius: .5rem; cursor: pointer; transition: background .15s;
  }
  .btn-back:hover { background: #f1f5f9; }

  .term-switcher {
    position: relative; display: flex; align-items: center;
    background: white; border: 1px solid #cbd5e1; border-radius: .5rem;
    padding: 0 .5rem 0 .75rem; gap: .25rem;
    font-size: .875rem; color: #334155;
  }
  .term-switcher select {
    background: transparent; border: none; outline: none;
    font-size: .875rem; color: #334155; padding: .5rem 0;
    cursor: pointer;
  }

  .btn-print {
    display: flex; align-items: center; gap: .5rem;
    background: #1e3a5f; color: white; font-size: .875rem;
    font-weight: 600; padding: .5rem 1rem; border: none;
    border-radius: .5rem; cursor: pointer; transition: background .15s;
  }
  .btn-print:hover { background: #16305a; }

  /* ── Result sheet ────────────────────────────────────────────────────────── */
  .sheet {
    background: white; border-radius: 1rem; border: 1px solid #dde3ec;
    padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,.06);
  }

  /* Sheet header */
  .sheet-header {
    display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1rem;
  }
  .sheet-logo {
    width: 4rem; height: 4rem; border-radius: .75rem;
    background: #1e3a5f; color: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sheet-school h2  { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
  .sheet-school p   { font-size: .875rem; color: #475569; }
  .sheet-term       { font-weight: 600; color: #1e3a5f; }

  .divider { border: none; border-top: 2px solid #1e3a5f; margin: 1rem 0; }

  /* Bio */
  .bio { margin-bottom: 1.25rem; }
  .bio-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: .75rem;
  }
  .bio-item { display: flex; flex-direction: column; gap: .15rem; }
  .bio-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
  .bio-value { font-size: .9375rem; font-weight: 600; color: #1e293b; }

  /* Summary */
  .summary-row {
    display: flex; gap: .625rem; margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .summary-box {
    flex: 1; min-width: 80px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: .5rem; padding: .625rem .75rem;
    display: flex; flex-direction: column; align-items: center; gap: .1rem;
  }
  .summary-val   { font-size: 1.375rem; font-weight: 700; color: #1e293b; }
  .summary-label { font-size: .7rem; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
  .highlight-pass { background: #f0fdf4; border-color: #86efac; }
  .highlight-pass .summary-val { color: #16a34a; }
  .highlight-fail { background: #fef2f2; border-color: #fca5a5; }
  .highlight-fail .summary-val { color: #dc2626; }
  .highlight-grade { background: #eff6ff; border-color: #93c5fd; }
  .highlight-grade .summary-val { color: #1d4ed8; }

  /* Result table */
  .result-table { width: 100%; border-collapse: collapse; font-size: .875rem; margin-bottom: 1.25rem; }
  .result-table th {
    background: #1e3a5f; color: white;
    padding: .625rem .75rem; text-align: center;
    font-size: .75rem; font-weight: 600; letter-spacing: .03em;
  }
  .result-table th.col-subject { text-align: left; }
  .result-table th.col-no      { width: 2rem; }

  .result-table td {
    padding: .5rem .75rem; border-bottom: 1px solid #f1f5f9;
    text-align: center; color: #334155;
  }
  .result-table td.col-subject { text-align: left; font-weight: 500; color: #1e293b; }
  .result-table td.col-no      { color: #94a3b8; font-size: .8rem; }
  .result-table .total-cell    { font-weight: 700; color: #1e293b; }

  .result-table .row-fail td { background: #fff5f5; }
  .result-table tr:hover td  { background: #f8fafc; }
  .result-table .row-fail:hover td { background: #fef2f2; }

  /* tfoot */
  .result-table tfoot td { border-top: 2px solid #e2e8f0; border-bottom: none; font-weight: 600; }
  .tfoot-label { text-align: right; color: #475569; font-size: .8rem; }

  /* Grade badges */
  .grade-badge {
    display: inline-block; font-size: .75rem; font-weight: 700;
    padding: .2rem .5rem; border-radius: .3rem; min-width: 2rem; text-align: center;
  }
  .gr-excellent { background: #dcfce7; color: #15803d; }
  .gr-good      { background: #dbeafe; color: #1d4ed8; }
  .gr-average   { background: #fef9c3; color: #a16207; }
  .gr-pass      { background: #fed7aa; color: #c2410c; }
  .gr-fail      { background: #fee2e2; color: #b91c1c; }
  .gr-default   { background: #f1f5f9; color: #475569; }

  /* Grade key */
  .grade-key {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: .5rem; padding: .75rem 1rem; margin-bottom: 1.25rem;
  }
  .grade-key-title { font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .05em; color: #64748b; margin-bottom: .5rem; }
  .grade-key-items { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; }
  .grade-key-items span { font-size: .8rem; color: #475569; }
  .grade-key-items b { color: #1e293b; }

  /* Signature blocks */
  .sheet-footer { display: flex; gap: 2rem; margin-top: 2rem; margin-bottom: .75rem; flex-wrap: wrap; }
  .sig-block { flex: 1; min-width: 140px; }
  .sig-line { border-top: 1px solid #334155; margin-bottom: .35rem; }
  .sig-block p { font-size: .75rem; color: #64748b; }

  .sheet-generated { font-size: .7rem; color: #94a3b8; }

  /* ── No results ─────────────────────────────────────────────────────────── */
  .no-results {
    display: flex; align-items: center; gap: .75rem;
    color: #64748b; font-size: .9375rem;
    padding: 1.5rem; background: #f8fafc;
    border-radius: .5rem; border: 1px dashed #cbd5e1;
    margin-bottom: 1.25rem;
  }

  /* ── Print styles ────────────────────────────────────────────────────────── */
  @media print {
    .no-print { display: none !important; }
    .page { background: white; }
    .main { padding: 0; max-width: 100%; }
    .sheet { border: none; box-shadow: none; border-radius: 0; padding: 1cm; }
    .sheet-header { margin-bottom: .5cm; }
    .result-table th { background: #1e3a5f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grade-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .summary-box { border: 1px solid #ccc !important; }
  }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .checker-card { padding: 1.5rem; }
    .sheet { padding: 1.25rem; }
    .summary-row { gap: .4rem; }
    .summary-val { font-size: 1.1rem; }
    .result-table { font-size: .8rem; }
    .result-table td, .result-table th { padding: .4rem .4rem; }
    .col-remark { display: none; }
    .sheet-footer { gap: 1rem; }
  }
</style>