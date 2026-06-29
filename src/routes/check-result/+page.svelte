<!-- src/routes/check-result/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Search, Printer, AlertCircle, BookOpen, ChevronDown, 
    CreditCard, Info, ArrowRight, ScanLine, LogIn
  } from 'lucide-svelte';

  let mounted = $state(false);
  onMount(() => { mounted = true; });

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
  <title>Check Result — LSAI Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
</svelte:head>

<!-- ── NAV ─────────────────────────────────────────────────────────────── -->
<nav class="nav">
  <div class="nav-logo">
    <div class="logo-box">S</div>
    <span class="logo-text">LSAI Portal</span>
  </div>
  <div class="nav-links">
    <a href="/" class="nav-result-link">
      <ArrowRight size={14} />
      Back to Home
    </a>
    <a href="/login" class="signin-btn">
      Sign In
      <LogIn size={14} />
    </a>
  </div>
</nav>

<!-- ── HERO ────────────────────────────────────────────────────────────── -->
<section class="hero">
  <div class="blob-1"></div>
  <div class="blob-2"></div>
  <div class="dot-grid"></div>

  <div class="hero-container">
    <div class="hero-content">
      {#if mounted}
        <div class="badge-container fade d0">
          <span class="pulse-dot"></span>
          <ScanLine size={14} />
          Student Result Portal
        </div>

        <h1 class="hero-title display fade d1">
          Check Your<br/>
          <em class="highlight">Academic</em><br/>
          Results
        </h1>

        <p class="hero-description fade d2">
          Enter your admission number and scratch card PIN to view and print
          your full academic report for any term.
        </p>

        <div class="hero-features fade d3">
          <div class="hero-feature">
            <span class="hero-feature-dot"></span>
            View CA scores, exam scores and positions
          </div>
          <div class="hero-feature">
            <span class="hero-feature-dot"></span>
            Print-ready report sheet
          </div>
          <div class="hero-feature">
            <span class="hero-feature-dot"></span>
            Switch between terms on one PIN
          </div>
        </div>
      {/if}
    </div>

    <!-- Checker Card -->
    {#if mounted}
      <div class="checker-wrapper fade d2">
        {#if !result}
          <div class="checker-card">
            <div class="checker-header">
              <div class="checker-icon-wrap">
                <CreditCard size={24} />
              </div>
              <h2 class="checker-title">Enter Your Details</h2>
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
                  placeholder="e.g. SMS/2025/0001"
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
                <h2>LSAI International Schools</h2>
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
      </div>
    {/if}
  </div>
</section>

<!-- ── FOOTER ───────────────────────────────────────────────────────────── -->
<footer class="footer">
  <div class="footer-container">
    <div class="footer-logo">
      <div class="footer-logo-box">LSAI</div>
      <span class="footer-logo-text">LSAI Portal</span>
    </div>
    <div class="footer-links">
      <a href="/" class="footer-link">Home</a>
      <a href="/login" class="footer-link">Staff Login</a>
    </div>
    <p class="footer-text">School Management System · Nursery, Primary &amp; Secondary</p>
  </div>
</footer>

<style>
  /* ── Reset ───────────────────────────────────────────────────────────────── */
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :global(body) {
    font-family: 'DM Sans', sans-serif;
    background: #f8f6f1;
    overflow-x: hidden;
  }

  .display { font-family: 'Playfair Display', serif; }

  /* ── Keyframes ────────────────────────────────────────────────────────────── */
  @keyframes morph {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    33%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    66%     { border-radius: 50% 50% 40% 60% / 40% 70% 50% 60%; }
  }
  @keyframes up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.5; }
  }

  .fade { opacity: 0; animation: up 0.7s ease forwards; }
  .d0 { animation-delay: 0s; }
  .d1 { animation-delay: 0.12s; }
  .d2 { animation-delay: 0.24s; }
  .d3 { animation-delay: 0.36s; }

  /* ── Navigation ──────────────────────────────────────────────────────────── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    padding: 1rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(248,246,241,.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  @media (min-width: 1024px) { .nav { padding: 1rem 3.5rem; } }

  .nav-logo { display: flex; align-items: center; gap: .625rem; }
  .logo-box {
    width: 2rem; height: 2rem; border-radius: .5rem;
    background: #1d4ed8; display: flex; align-items: center; justify-content: center;
    color: white; font-size: .875rem; font-weight: 900;
    letter-spacing: -.025em; user-select: none;
  }
  .logo-text { font-weight: 600; color: #1c1917; letter-spacing: -.025em; font-size: .875rem; }

  .nav-links { display: flex; align-items: center; gap: .75rem; }

  .nav-result-link {
    display: flex; align-items: center; gap: .375rem;
    padding: .4375rem 1rem; border-radius: 9999px;
    border: 1px solid #1d4ed8; color: #1d4ed8;
    font-size: .8125rem; font-weight: 600; text-decoration: none;
    transition: all .15s ease;
  }
  .nav-result-link:hover { background: #eff6ff; }

  .signin-btn {
    padding: .5rem 1.25rem; border-radius: 9999px;
    background: #1d4ed8; color: white;
    font-size: .875rem; font-weight: 600; text-decoration: none;
    display: flex; align-items: center; gap: .5rem;
    transition: all .15s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,.05);
  }
  .signin-btn:hover { background: #1e40af; transform: scale(.98); }

  /* ── Hero ────────────────────────────────────────────────────────────────── */
  .hero {
    position: relative; min-height: 100vh;
    display: flex; align-items: center;
    padding: 6rem 1.5rem 4rem; overflow: hidden; background: #f8f6f1;
  }
  @media (min-width: 1024px) { .hero { padding: 6rem 3.5rem 4rem; } }

  .blob-1 {
    position: absolute; top: 2.5rem; right: -100px;
    width: 700px; height: 700px; opacity: .18; pointer-events: none;
    background: radial-gradient(ellipse, #bfdbfe 0%, #c4b5fd 45%, transparent 75%);
    animation: morph 10s ease-in-out infinite;
  }
  .blob-2 {
    position: absolute; bottom: -80px; left: -120px;
    width: 500px; height: 500px; opacity: .14; pointer-events: none;
    background: radial-gradient(ellipse, #fde68a 0%, #fca5a5 55%, transparent 80%);
    animation: morph 14s ease-in-out infinite reverse;
  }
  .dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px);
    background-size: 28px 28px; opacity: .06; pointer-events: none;
  }

  .hero-container {
    position: relative; z-index: 10;
    max-width: 72rem; margin: 0 auto; width: 100%;
    display: grid; gap: 4rem; align-items: start;
  }
  @media (min-width: 1024px) {
    .hero-container { grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
  }

  .badge-container {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .375rem .75rem; border-radius: 9999px;
    background: #eff6ff; border: 1px solid #dbeafe;
    color: #1d4ed8; font-size: .75rem; font-weight: 500; margin-bottom: 1.75rem;
  }
  .pulse-dot {
    width: .375rem; height: .375rem; border-radius: 50%; background: #3b82f6;
    display: inline-block; animation: pulse 2s ease-in-out infinite;
  }

  .hero-title {
    font-size: 3.4rem; font-weight: 900; color: #1c1917;
    line-height: 1.04; letter-spacing: -.025em; margin-bottom: 1.5rem;
  }
  @media (min-width: 1024px) { .hero-title { font-size: 4rem; } }
  .highlight { font-style: normal; color: #1d4ed8; }

  .hero-description {
    color: #78716c; font-size: 1.125rem; line-height: 1.625;
    margin-bottom: 2rem; max-width: 420px;
  }

  .hero-features {
    display: flex; flex-direction: column; gap: .75rem;
  }
  .hero-feature {
    display: flex; align-items: center; gap: .625rem;
    color: #57534e; font-size: .875rem;
  }
  .hero-feature-dot {
    width: .375rem; height: .375rem; border-radius: 50%;
    background: #1d4ed8; flex-shrink: 0;
  }

  /* ── Checker Card ────────────────────────────────────────────────────────── */
  .checker-wrapper { width: 100%; }

  .checker-card {
    background: white; border-radius: 1.5rem; border: 1px solid #f5f5f4;
    padding: 1.75rem; width: 100%;
    box-shadow: 0 24px 48px rgba(0,0,0,.08);
  }

  .checker-header {
    display: flex; align-items: center; gap: .75rem;
    margin-bottom: 1.5rem;
  }
  .checker-icon-wrap {
    width: 3rem; height: 3rem; border-radius: .75rem;
    background: #eff6ff; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .checker-icon-wrap :global(svg) { color: #1d4ed8; }
  .checker-title { font-size: 1.125rem; font-weight: 700; color: #1c1917; }

  .alert {
    display: flex; align-items: flex-start; gap: .5rem;
    font-size: .875rem; border-radius: .5rem; padding: .75rem 1rem;
    margin-bottom: 1.25rem; line-height: 1.5;
  }
  .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }

  .form { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: .3rem; }
  label  { font-size: .8125rem; font-weight: 600; color: #1c1917; }

  input[type="text"] {
    width: 100%; padding: .625rem .875rem;
    border: 1px solid #d6d3d1; border-radius: .5rem;
    font-size: .9375rem; color: #1c1917; background: white;
    transition: border-color .15s, box-shadow .15s;
    letter-spacing: .02em;
  }
  input:focus { outline: none; border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,.12); }

  .field-hint { font-size: .75rem; color: #a8a29e; margin-top: .2rem; }

  .btn-check {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: .5rem; background: #1d4ed8; color: white;
    font-size: .9375rem; font-weight: 600;
    padding: .75rem 1rem; border: none; border-radius: .5rem;
    cursor: pointer; margin-top: .25rem;
    transition: background .15s, transform .1s, opacity .15s;
  }
  .btn-check:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); }
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
    background: white; border: 1px solid #d6d3d1; color: #57534e;
    font-size: .875rem; font-weight: 500; padding: .5rem .875rem;
    border-radius: .5rem; cursor: pointer; transition: background .15s;
  }
  .btn-back:hover { background: #f5f5f4; }

  .term-switcher {
    position: relative; display: flex; align-items: center;
    background: white; border: 1px solid #d6d3d1; border-radius: .5rem;
    padding: 0 .5rem 0 .75rem; gap: .25rem;
    font-size: .875rem; color: #57534e;
  }
  .term-switcher select {
    background: transparent; border: none; outline: none;
    font-size: .875rem; color: #57534e; padding: .5rem 0;
    cursor: pointer;
  }

  .btn-print {
    display: flex; align-items: center; gap: .5rem;
    background: #1d4ed8; color: white; font-size: .875rem;
    font-weight: 600; padding: .5rem 1rem; border: none;
    border-radius: .5rem; cursor: pointer; transition: background .15s;
  }
  .btn-print:hover { background: #1e40af; }

  /* ── Result sheet ────────────────────────────────────────────────────────── */
  .sheet {
    background: white; border-radius: 1.5rem; border: 1px solid #f5f5f4;
    padding: 2rem; box-shadow: 0 24px 48px rgba(0,0,0,.06);
  }

  /* Sheet header */
  .sheet-header {
    display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1rem;
  }
  .sheet-logo {
    width: 4rem; height: 4rem; border-radius: .75rem;
    background: #1d4ed8; color: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sheet-school h2  { font-size: 1.25rem; font-weight: 700; color: #1c1917; }
  .sheet-school p   { font-size: .875rem; color: #78716c; }
  .sheet-term       { font-weight: 600; color: #1d4ed8; }

  .divider { border: none; border-top: 2px solid #1d4ed8; margin: 1rem 0; }

  /* Bio */
  .bio { margin-bottom: 1.25rem; }
  .bio-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: .75rem;
  }
  .bio-item { display: flex; flex-direction: column; gap: .15rem; }
  .bio-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #a8a29e; }
  .bio-value { font-size: .9375rem; font-weight: 600; color: #1c1917; }

  /* Summary */
  .summary-row {
    display: flex; gap: .625rem; margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .summary-box {
    flex: 1; min-width: 80px;
    background: #fafaf9; border: 1px solid #f5f5f4;
    border-radius: .5rem; padding: .625rem .75rem;
    display: flex; flex-direction: column; align-items: center; gap: .1rem;
  }
  .summary-val   { font-size: 1.375rem; font-weight: 700; color: #1c1917; }
  .summary-label { font-size: .7rem; color: #a8a29e; text-transform: uppercase; letter-spacing: .04em; }
  .highlight-pass { background: #f0fdf4; border-color: #86efac; }
  .highlight-pass .summary-val { color: #16a34a; }
  .highlight-fail { background: #fef2f2; border-color: #fca5a5; }
  .highlight-fail .summary-val { color: #dc2626; }
  .highlight-grade { background: #eff6ff; border-color: #93c5fd; }
  .highlight-grade .summary-val { color: #1d4ed8; }

  /* Result table */
  .result-table { width: 100%; border-collapse: collapse; font-size: .875rem; margin-bottom: 1.25rem; }
  .result-table th {
    background: #1d4ed8; color: white;
    padding: .625rem .75rem; text-align: center;
    font-size: .75rem; font-weight: 600; letter-spacing: .03em;
  }
  .result-table th.col-subject { text-align: left; }
  .result-table th.col-no      { width: 2rem; }

  .result-table td {
    padding: .5rem .75rem; border-bottom: 1px solid #f5f5f4;
    text-align: center; color: #57534e;
  }
  .result-table td.col-subject { text-align: left; font-weight: 500; color: #1c1917; }
  .result-table td.col-no      { color: #a8a29e; font-size: .8rem; }
  .result-table .total-cell    { font-weight: 700; color: #1c1917; }

  .result-table .row-fail td { background: #fff5f5; }
  .result-table tr:hover td  { background: #fafaf9; }
  .result-table .row-fail:hover td { background: #fef2f2; }

  /* tfoot */
  .result-table tfoot td { border-top: 2px solid #f5f5f4; border-bottom: none; font-weight: 600; }
  .tfoot-label { text-align: right; color: #78716c; font-size: .8rem; }

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
  .gr-default   { background: #f5f5f4; color: #78716c; }

  /* Grade key */
  .grade-key {
    background: #fafaf9; border: 1px solid #f5f5f4;
    border-radius: .5rem; padding: .75rem 1rem; margin-bottom: 1.25rem;
  }
  .grade-key-title { font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .05em; color: #a8a29e; margin-bottom: .5rem; }
  .grade-key-items { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; }
  .grade-key-items span { font-size: .8rem; color: #78716c; }
  .grade-key-items b { color: #1c1917; }

  /* Signature blocks */
  .sheet-footer { display: flex; gap: 2rem; margin-top: 2rem; margin-bottom: .75rem; flex-wrap: wrap; }
  .sig-block { flex: 1; min-width: 140px; }
  .sig-line { border-top: 1px solid #57534e; margin-bottom: .35rem; }
  .sig-block p { font-size: .75rem; color: #a8a29e; }

  .sheet-generated { font-size: .7rem; color: #a8a29e; }

  /* ── No results ─────────────────────────────────────────────────────────── */
  .no-results {
    display: flex; align-items: center; gap: .75rem;
    color: #78716c; font-size: .9375rem;
    padding: 1.5rem; background: #fafaf9;
    border-radius: .5rem; border: 1px dashed #d6d3d1;
    margin-bottom: 1.25rem;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */
  .footer { padding: 2rem 1.5rem; border-top: 1px solid rgba(231,229,228,.8); background: #f8f6f1; }
  @media (min-width: 1024px) { .footer { padding: 2rem 3.5rem; } }
  .footer-container {
    max-width: 72rem; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  }
  .footer-logo { display: flex; align-items: center; gap: .5rem; }
  .footer-logo-box {
    width: 1.5rem; height: 1.5rem; border-radius: .375rem; background: #1d4ed8;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: .65rem; font-weight: 700;
  }
  .footer-logo-text { font-size: .875rem; font-weight: 500; color: #57534e; }
  .footer-links { display: flex; gap: 1.25rem; }
  .footer-link { font-size: .8125rem; color: #78716c; text-decoration: none; transition: color .15s; }
  .footer-link:hover { color: #1d4ed8; }
  .footer-text { font-size: .75rem; color: #a8a29e; }

  /* ── Print styles ────────────────────────────────────────────────────────── */
  @media print {
    .no-print { display: none !important; }
    .hero { padding: 0; min-height: auto; }
    .hero-container { display: block; }
    .checker-wrapper { max-width: 100%; }
    .sheet { border: none; box-shadow: none; border-radius: 0; padding: 1cm; }
    .sheet-header { margin-bottom: .5cm; }
    .result-table th { background: #1d4ed8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grade-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .summary-box { border: 1px solid #ccc !important; }
    .sheet-logo { background: #1d4ed8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .divider { border-top-color: #1d4ed8; }
  }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .checker-card { padding: 1.25rem; }
    .sheet { padding: 1.25rem; }
    .summary-row { gap: .4rem; }
    .summary-val { font-size: 1.1rem; }
    .result-table { font-size: .8rem; }
    .result-table td, .result-table th { padding: .4rem .4rem; }
    .col-remark { display: none; }
    .sheet-footer { gap: 1rem; }
    .hero-title { font-size: 2.5rem; }
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .fade { animation: none; opacity: 1; }
    .blob-1, .blob-2 { animation: none; }
    .pulse-dot { animation: none; }
  }
</style>