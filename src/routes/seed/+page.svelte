<!-- src/routes/seed/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { Building2, CheckCircle2, Loader2, DatabaseZap, RefreshCw, Users } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);

  const CLASS_COUNT = 27;

  // Map raw count keys to friendly display labels
  const COUNT_LABELS: Record<string, string> = {
    users:              'Users',
    staff:              'Staff',
    academicYears:      'Acad. Years',
    terms:              'Terms',
    gradeScales:        'Grade Scales',
    subjects:           'Subjects',
    classes:            'Classes',
    feeStructures:      'Fee Structures',
    scratchCards:       'Scratch Cards',
    students:           'Students',
    results:            'Result Records',
    attendanceRecords:  'Attendance Rows',
    feeRecords:         'Fee Records',
  };
</script>

<svelte:head>
  <title>Database Seed — School Management System</title>
</svelte:head>

<div class="page">
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="icon-wrap">
        <DatabaseZap size={32} />
      </div>
      <h1>Database Seed</h1>
      <p class="subtitle">Populate realistic demo data — safe to run multiple times</p>
    </div>

    <!-- Live DB stats -->
    <div class="stats-bar">
      <span class="stat"><Users size={13} /> {data.stats.users} users</span>
      <span class="stat">🎓 {data.stats.students} students</span>
      <span class="stat">🏫 {data.stats.classes} classes</span>
      <span class="stat">📚 {data.stats.subjects} subjects</span>
      <span class="stat">📊 {data.stats.results} results</span>
      <span class="stat">📅 {data.stats.attendance} attendance rows</span>
    </div>

    <!-- ── Success result ── -->
    {#if form?.success}
      <div class="result-card">
        <div class="result-header">
          <CheckCircle2 size={20} />
          <strong>{form.message}</strong>
        </div>
        <div class="result-grid">
          {#each Object.entries(form.counts) as [key, val]}
            {#if (val as number) > 0}
              <div class="result-item">
                <span class="result-val">{(val as number).toLocaleString()}</span>
                <span class="result-key">{COUNT_LABELS[key] ?? key}</span>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Demo account credentials -->
        <div class="creds">
          <p class="creds-title">Demo Account Passwords</p>
          <table class="creds-table">
            <thead>
              <tr><th>Role</th><th>Email</th><th>Password</th></tr>
            </thead>
            <tbody>
              <tr class="row-admin">
                <td><span class="badge admin">Super Admin</span></td>
                <td class="mono">{form.adminEmail}</td>
                <td class="mono">{form.adminPass}</td>
              </tr>
              <tr><td><span class="badge teacher">Teacher</span></td><td class="mono">teacher1@demo.school</td><td class="mono">Teacher@123</td></tr>
              <tr><td><span class="badge teacher">Teacher</span></td><td class="mono">teacher2@demo.school</td><td class="mono">Teacher@123</td></tr>
              <tr><td><span class="badge teacher">Teacher</span></td><td class="mono">teacher3@demo.school</td><td class="mono">Teacher@123</td></tr>
              <tr><td><span class="badge teacher">Teacher</span></td><td class="mono">teacher4@demo.school</td><td class="mono">Teacher@123</td></tr>
              <tr><td><span class="badge bursar">Bursar</span></td><td class="mono">bursar@demo.school</td><td class="mono">Teacher@123</td></tr>
            </tbody>
          </table>
          <p class="creds-note">⚠️ Save these credentials — this page will not show them again after navigating away.</p>
        </div>
        <div class="result-actions">
          <a href="/login" class="btn-primary">Go to Login →</a>
          <button class="btn-ghost" onclick={() => window.location.reload()}>
            <RefreshCw size={14} /> Run Again
          </button>
        </div>
      </div>

    {:else}
      <!-- Error -->
      {#if form?.error}
        <div class="error-box">{form.error}</div>
      {/if}

      <div class="card">
        <form
          method="POST"
          action="?/seed"
          use:enhance={() => {
            loading = true;
            return async ({ update }) => { loading = false; update(); };
          }}
        >
          <!-- School -->
          <section>
            <h2 class="section-title"><Building2 size={14} /> School</h2>
            <div class="field">
              <label for="schoolName">School Name</label>
              <input id="schoolName" name="schoolName" type="text" placeholder="e.g. Greenfield Academy" />
            </div>
          </section>

          <!-- Admin account -->
          <section>
            <h2 class="section-title">Super Admin Account</h2>
            <div class="row2">
              <div class="field">
                <label for="adminEmail">Email <span class="req">*</span></label>
                <input id="adminEmail" name="adminEmail" type="email" required placeholder="headmaster@school.edu.ng" />
              </div>
              <div class="field">
                <label for="adminPass">Password <span class="req">*</span></label>
                <input id="adminPass" name="adminPass" type="password" required minlength="8" placeholder="Min 8 characters" />
              </div>
            </div>
            <p class="hint">Skipped if this email already exists.</p>
          </section>

          <!-- Academic year -->
          <section>
            <h2 class="section-title">Academic Year</h2>
            <div class="field">
              <label for="yearName">Year Name <span class="req">*</span></label>
              <input id="yearName" name="yearName" type="text" required value="2025/2026" />
            </div>
            <div class="row2">
              <div class="field">
                <label for="yearStart">Start Date <span class="req">*</span></label>
                <input id="yearStart" name="yearStart" type="date" required value="2025-09-09" />
              </div>
              <div class="field">
                <label for="yearEnd">End Date <span class="req">*</span></label>
                <input id="yearEnd" name="yearEnd" type="date" required value="2026-07-25" />
              </div>
            </div>
          </section>

          <!-- Students -->
          <section>
            <h2 class="section-title"><Users size={14} /> Students</h2>
            <div class="field">
              <label for="studentsPerClass">Students per class (1–50)</label>
              <input id="studentsPerClass" name="studentsPerClass" type="number" min="1" max="50" value="15" />
            </div>
            <p class="hint">
              {CLASS_COUNT} classes × count = up to {CLASS_COUNT * 15} students at default.<br />
              Each student gets results, attendance records, and fee records. Existing records are skipped.
            </p>
          </section>

          <!-- Preview -->
          <div class="preview">
            <p class="preview-title">Seeds (skips duplicates):</p>
            <div class="preview-grid">
              <span>✓ Super Admin + 5 demo staff</span>
              <span>✓ Academic year + 3 terms</span>
              <span>✓ Grade scales (all 3 levels)</span>
              <span>✓ 20 subjects across all levels</span>
              <span>✓ 27 classes (Nursery 1 → SS 3)</span>
              <span>✓ 15 fee structures</span>
              <span>✓ 200 scratch cards + 1 demo card</span>
              <span>✓ Students with realistic profiles</span>
              <span>✓ CA + exam scores, grades, positions</span>
              <span>✓ Daily attendance (every school day)</span>
              <span>✓ Fee records (paid/partial/pending)</span>
            </div>
          </div>

          <div class="warning">
            ⚠️ With 15 students/class this seeds ~27,000 attendance rows. Use fewer students for faster seeding.
          </div>

          <button type="submit" class="submit-btn" disabled={loading}>
            {#if loading}
              <Loader2 size={16} class="spin" />
              Seeding… this may take a minute
            {:else}
              <DatabaseZap size={16} />
              Run Seed
            {/if}
          </button>
        </form>
      </div>
    {/if}

  </div>
</div>

<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem 1rem 4rem;
  }
  .wrapper { width: 100%; max-width: 40rem; display: flex; flex-direction: column; gap: 1.125rem; }

  /* Header */
  .header { text-align: center; padding: .75rem 0; }
  .icon-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    width: 3.5rem; height: 3.5rem; border-radius: 1rem;
    background: #7c3aed; color: white; margin-bottom: .875rem;
    box-shadow: 0 8px 20px rgba(124,58,237,.28);
  }
  .header h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
  .subtitle   { color: #64748b; font-size: .875rem; margin-top: .25rem; }

  /* Stats bar */
  .stats-bar {
    display: flex; gap: .625rem; flex-wrap: wrap;
    background: white; border: 1px solid #e2e8f0;
    border-radius: .75rem; padding: .75rem 1rem;
  }
  .stat {
    display: flex; align-items: center; gap: .3rem;
    font-size: .8rem; color: #475569; font-weight: 500;
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: .375rem; padding: .25rem .5rem;
  }

  /* Error */
  .error-box {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; font-size: .875rem; border-radius: .5rem; padding: .75rem 1rem;
  }

  /* Main card */
  .card { background: white; border-radius: .875rem; border: 1px solid #e2e8f0; padding: 1.5rem; }
  .card form { display: flex; flex-direction: column; gap: 1.375rem; }

  section { display: flex; flex-direction: column; gap: .75rem; }
  .section-title {
    display: flex; align-items: center; gap: .4rem;
    font-size: .75rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: .06em;
    padding-bottom: .5rem; border-bottom: 1px solid #f1f5f9;
  }

  .field { display: flex; flex-direction: column; gap: .3rem; }
  label  { font-size: .8125rem; font-weight: 500; color: #334155; }
  .req   { color: #ef4444; }

  input[type="text"],input[type="email"],input[type="password"],
  input[type="date"],input[type="number"] {
    width: 100%; padding: .5rem .75rem;
    border: 1px solid #cbd5e1; border-radius: .5rem;
    font-size: .875rem; color: #0f172a; background: white;
    transition: border-color .15s, box-shadow .15s;
  }
  input:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.12); }

  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
  .hint { font-size: .75rem; color: #94a3b8; line-height: 1.5; }

  /* Preview */
  .preview {
    background: #faf5ff; border: 1px solid #ede9fe;
    border-radius: .5rem; padding: .875rem 1rem;
  }
  .preview-title {
    font-size: .75rem; font-weight: 700; color: #7c3aed;
    text-transform: uppercase; letter-spacing: .05em; margin-bottom: .625rem;
  }
  .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .25rem .5rem; }
  .preview-grid span { font-size: .8rem; color: #5b21b6; }

  /* Warning */
  .warning {
    background: #fffbeb; border: 1px solid #fde68a;
    color: #92400e; font-size: .8rem; border-radius: .5rem; padding: .625rem .875rem;
    line-height: 1.5;
  }

  /* Submit */
  .submit-btn {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: .5rem; background: #7c3aed; color: white;
    font-size: .9375rem; font-weight: 600; padding: .75rem 1rem;
    border: none; border-radius: .5rem; cursor: pointer;
    transition: background .15s, transform .1s, opacity .15s;
  }
  .submit-btn:hover:not(:disabled)  { background: #6d28d9; transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

  /* Result card */
  .result-card {
    background: white; border: 1px solid #bbf7d0;
    border-radius: .875rem; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }
  .result-header { display: flex; align-items: center; gap: .625rem; color: #15803d; font-size: 1rem; }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: .625rem;
  }
  .result-item {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: .5rem; padding: .5rem .625rem;
    display: flex; flex-direction: column; align-items: center; gap: .1rem;
  }
  .result-val { font-size: 1.2rem; font-weight: 700; color: #15803d; }
  .result-key { font-size: .7rem; color: #64748b; text-align: center; }

  .result-actions { display: flex; gap: .75rem; align-items: center; }
  .btn-primary {
    background: #7c3aed; color: white; font-size: .875rem;
    font-weight: 600; padding: .5rem 1.125rem;
    border-radius: .5rem; text-decoration: none; transition: background .15s;
  }
  .btn-primary:hover { background: #6d28d9; }
  .btn-ghost {
    display: flex; align-items: center; gap: .35rem;
    background: none; border: 1px solid #e2e8f0; color: #475569;
    font-size: .875rem; padding: .5rem .875rem; border-radius: .5rem;
    cursor: pointer; transition: background .15s;
  }
  .btn-ghost:hover { background: #f8fafc; }

  /* Credentials table */
  .creds {
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: .625rem; padding: 1rem 1.125rem;
    display: flex; flex-direction: column; gap: .75rem;
  }
  .creds-title {
    font-size: .75rem; font-weight: 700; color: #92400e;
    text-transform: uppercase; letter-spacing: .05em;
  }
  .creds-table { width: 100%; border-collapse: collapse; font-size: .8125rem; }
  .creds-table th {
    text-align: left; font-size: .7rem; font-weight: 600;
    color: #92400e; text-transform: uppercase; letter-spacing: .04em;
    padding: .3rem .5rem; border-bottom: 1px solid #fde68a;
  }
  .creds-table td { padding: .4rem .5rem; border-bottom: 1px solid #fef3c7; color: #1e293b; vertical-align: middle; }
  .creds-table tr:last-child td { border-bottom: none; }
  .mono { font-family: ui-monospace, monospace; font-size: .8rem; }
  .badge {
    display: inline-block; font-size: .7rem; font-weight: 600;
    padding: .15rem .45rem; border-radius: .3rem;
  }
  .badge.admin   { background: #7c3aed; color: white; }
  .badge.teacher { background: #2563eb; color: white; }
  .badge.bursar  { background: #0891b2; color: white; }
  .creds-note { font-size: .75rem; color: #92400e; }


  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .row2 { grid-template-columns: 1fr; }
    .preview-grid { grid-template-columns: 1fr; }
    .card { padding: 1.25rem; }
  }
</style>