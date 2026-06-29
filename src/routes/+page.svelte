<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Users, BookOpen, Trophy, CheckSquare, Clock, DollarSign,
    LogIn, ArrowRight, LayoutDashboard, GraduationCap, Calendar,
    PlusCircle, BarChart3, Bell, Home, Settings, UserPlus,
    FileText, CreditCard, Shield, Briefcase, Eye, Star,
    ScanLine, Search
  } from 'lucide-svelte';

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  const stats = [
    { value: '3',    label: 'School Levels' },
    { value: '100+', label: 'Students Managed' },
    { value: '7',    label: 'Core Modules' },
    { value: '99%',  label: 'Uptime' },
  ];

  const features = [
    { icon: Users,       title: 'Staff Management',     desc: 'Onboard and manage teaching and non-teaching staff with roles, qualifications and departmental assignments.' },
    { icon: BookOpen,    title: 'Student Enrolment',    desc: 'Register students across Nursery, Primary and Secondary with full profile, class and guardian records.' },
    { icon: Trophy,      title: 'Results & Grading',    desc: "Enter CA and exam scores per subject. Grades are computed automatically using your school's scale." },
    { icon: CheckSquare, title: 'Attendance Tracking',  desc: 'Mark daily class attendance in bulk. Track presence, absence, lateness and excused absences.' },
    { icon: Clock,       title: 'Timetable',            desc: 'Build weekly class schedules by assigning subjects, teachers and periods per day.' },
    { icon: DollarSign,  title: 'Fee Management',       desc: 'Define termly fee structures, record payments and track outstanding balances with receipts.' },
  ];

  const roles = [
    { role: 'Headmaster',     icon: Briefcase,  desc: 'Full system access',             color: 'role-blue'    },
    { role: 'Admin / Bursar', icon: CreditCard, desc: 'Students, fees, reports',        color: 'role-violet'  },
    { role: 'Teacher',        icon: Users,      desc: 'Results, attendance, timetable', color: 'role-emerald' },
    { role: 'Student/Parent', icon: Eye,        desc: 'View results & timetable',       color: 'role-amber'   },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, active: true  },
    { icon: Users,           active: false },
    { icon: BookOpen,        active: false },
    { icon: Trophy,          active: false },
    { icon: CheckSquare,     active: false },
    { icon: Clock,           active: false },
    { icon: DollarSign,      active: false },
  ];

  // PIN formatting for the homepage demo input
  let demoPin = $state('');
  let demoPinDisplay = $state('');
  function onDemoPinInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 12);
    demoPin        = raw;
    demoPinDisplay = raw.match(/.{1,4}/g)?.join('-') ?? raw;
  }
</script>

<svelte:head>
  <title>LSAI — School Management System</title>
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
    <a href="/check-result" class="nav-result-link">
      <ScanLine size={14} />
      Check Result
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
          Nursery · Primary · Secondary
        </div>

        <h1 class="hero-title display fade d1">
          One system<br/>
          <em class="highlight">for every</em><br/>
          school level.
        </h1>

        <p class="hero-description fade d2">
          Manage staff, students, results, attendance, timetables and fees —
          all in one unified portal built for Nigerian schools.
        </p>

        <div class="hero-cta fade d3">
          <a href="/login" class="cta-btn">
            Get Started
            <ArrowRight size={16} />
          </a>
          <a href="/check-result" class="cta-ghost">
            <ScanLine size={15} />
            Check Result
          </a>
        </div>

        <div class="stats-grid fade d4">
          {#each stats as s}
            <div>
              <p class="stat-value display">{s.value}</p>
              <p class="stat-label">{s.label}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Dashboard mockup -->
    {#if mounted}
      <div class="mockup-wrapper fade d2">
        <div class="floating-badge students">
          <div class="badge-icon">
            <GraduationCap size={18} />
          </div>
          <div>
            <p class="badge-label">Enrolled</p>
            <p class="badge-value">247 Students</p>
          </div>
        </div>

        <div class="floating-badge attendance">
          <CheckSquare size={18} />
          <div>
            <p class="badge-label">Today's attendance</p>
            <p class="badge-value">94% Present</p>
          </div>
        </div>

        <div class="browser-chrome">
          <div class="browser-bar">
            <span class="window-dot red"></span>
            <span class="window-dot yellow"></span>
            <span class="window-dot green"></span>
            <div class="url-bar">
              <span>lsainternational.vercel.app/dashboard</span>
            </div>
          </div>

          <div class="app-shell">
            <div class="sidebar">
              {#each sidebarItems as item}
                <div class="sidebar-icon {item.active ? 'active' : ''}">
                  <item.icon size={16} />
                </div>
              {/each}
            </div>

            <div class="dashboard-content">
              <div class="dashboard-header">
                <p class="dashboard-title">Dashboard</p>
                <div class="term-badge">First Term · 2025/2026</div>
              </div>

              <div class="stat-tiles">
                {#each [
                  { label: 'Staff',    value: '32',  bg: 'blue'    },
                  { label: 'Students', value: '247', bg: 'emerald' },
                  { label: 'Classes',  value: '18',  bg: 'violet'  },
                ] as tile}
                  <div class="stat-tile">
                    <div class="tile-color {tile.bg}"></div>
                    <p class="tile-value">{tile.value}</p>
                    <p class="tile-label">{tile.label}</p>
                  </div>
                {/each}
              </div>

              <div class="quick-actions">
                {#each ['+ Add Student', 'Enter Results', 'Mark Attendance', 'View Timetable'] as action}
                  <div class="action-btn">{action}</div>
                {/each}
              </div>

              <div class="skeleton-list">
                {#each [1,2,3] as _}
                  <div class="skeleton-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-badge"></div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- ── RESULT CHECKER BAND ───────────────────────────────────────────────── -->
<section class="checker-band">
  <div class="checker-inner">
    <div class="checker-text">
      <div class="checker-eyebrow">
        <ScanLine size={14} />
        Student Result Portal
      </div>
      <h2 class="checker-heading display">
        Check your result<br/>with a scratch card.
      </h2>
      <p class="checker-sub">
        Enter your admission number and the PIN on your scratch card
        to view and print your full academic report for any term.
      </p>
      <ul class="checker-bullets">
        <li><span class="bullet-dot"></span> Works for Nursery, Primary &amp; Secondary</li>
        <li><span class="bullet-dot"></span> View CA scores, exam scores and positions</li>
        <li><span class="bullet-dot"></span> Print-ready report sheet</li>
        <li><span class="bullet-dot"></span> Switch between terms on one PIN</li>
      </ul>
      <a href="/check-result" class="checker-cta">
        Check My Result
        <ArrowRight size={15} />
      </a>
    </div>

    <!-- Mini scratch-card preview -->
    <div class="card-preview-wrap">
      <!-- Fake scratch card -->
      <div class="scratch-card">
        <div class="sc-header">
          <div class="sc-logo-row">
            <div class="sc-logo-box">S</div>
            <span class="sc-school">LSAI Portal</span>
          </div>
          <span class="sc-label">RESULT CHECKER CARD</span>
        </div>

        <div class="sc-body">
          <div class="sc-field">
            <span class="sc-field-label">Admission No.</span>
            <div class="sc-field-input">SMS/2025/0147</div>
          </div>
          <div class="sc-field">
            <span class="sc-field-label">Scratch Card PIN</span>
            <div class="sc-pin-row">
              <div class="sc-field-input sc-pin">1234 – 5678 – 9012</div>
            </div>
          </div>
          <a href="/check-result" class="sc-go-btn">
            <Search size={13} />
            Check Result
          </a>
        </div>

        <div class="sc-footer">
          <span>Serial: SC-DEMO-000001</span>
          <span>Valid: 2025/2026</span>
        </div>
      </div>

      <!-- Floating result preview -->
      <div class="result-preview">
        <div class="rp-header">
          <div class="rp-name">Ngozi Okonkwo</div>
          <div class="rp-class">JSS 2A · First Term</div>
        </div>
        <div class="rp-rows">
          {#each [
            { subj: 'English',    score: 78, grade: 'A1' },
            { subj: 'Mathematics',score: 62, grade: 'C4' },
            { subj: 'Basic Sci.', score: 71, grade: 'B2' },
          ] as row}
            <div class="rp-row">
              <span class="rp-subj">{row.subj}</span>
              <span class="rp-score">{row.score}</span>
              <span class="rp-grade grade-{row.grade.replace(/\d/,'')}">{row.grade}</span>
            </div>
          {/each}
        </div>
        <div class="rp-avg">Average: <strong>70.3%</strong></div>
      </div>
    </div>
  </div>
</section>

<!-- ── FEATURES ─────────────────────────────────────────────────────────── -->
<section class="features">
  <div class="features-container">
    <div class="section-header">
      <p class="section-subtitle">Everything you need</p>
      <h2 class="section-title display">
        Built for the full<br/>school operation.
      </h2>
    </div>

    <div class="features-grid">
      {#each features as f}
        <div class="feature-card">
          <div class="feature-icon">
            <f.icon size={24} />
          </div>
          <h3 class="feature-title">{f.title}</h3>
          <p class="feature-desc">{f.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ── ROLES ────────────────────────────────────────────────────────────── -->
<section class="roles">
  <div class="roles-container">
    <p class="roles-subtitle">Role-based access</p>
    <h2 class="roles-title display">
      Right access for every user.
    </h2>
    <p class="roles-description">
      From the Headmaster to class teachers — everyone sees exactly what they need, nothing more.
    </p>

    <div class="roles-grid">
      {#each roles as r}
        <div class="role-card {r.color}">
          <div class="role-icon">
            <r.icon size={28} />
          </div>
          <p class="role-name">{r.role}</p>
          <p class="role-desc">{r.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ── CTA ──────────────────────────────────────────────────────────────── -->
<section class="cta-section">
  <div class="cta-container">
    <div class="cta-icon">
      <Star size={48} />
    </div>
    <h2 class="cta-title display">
      Ready to run your<br/>school smarter?
    </h2>
    <p class="cta-text">
      Login with your admin credentials to get started.
    </p>
    <div class="cta-buttons">
      <a href="/login" class="cta-button">
        Sign In to Portal
        <LogIn size={18} />
      </a>
      <a href="/check-result" class="cta-button-ghost">
        <ScanLine size={16} />
        Check Result
      </a>
    </div>
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
      <a href="/check-result" class="footer-link">Check Result</a>
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
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-8px); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.5; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .fade { opacity: 0; animation: up 0.7s ease forwards; }
  .d0 { animation-delay: 0s; }
  .d1 { animation-delay: 0.12s; }
  .d2 { animation-delay: 0.24s; }
  .d3 { animation-delay: 0.36s; }
  .d4 { animation-delay: 0.52s; }

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
    display: grid; gap: 4rem; align-items: center;
  }
  @media (min-width: 1024px) {
    .hero-container { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
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
  @media (min-width: 1024px) { .hero-title { font-size: 4.2rem; } }
  .highlight { font-style: normal; color: #1d4ed8; }

  .hero-description {
    color: #78716c; font-size: 1.125rem; line-height: 1.625;
    margin-bottom: 2.5rem; max-width: 420px;
  }

  .hero-cta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 3.5rem; }

  .cta-btn {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .875rem 1.75rem; border-radius: 9999px;
    background: #1d4ed8; color: white;
    font-weight: 600; font-size: .875rem; text-decoration: none;
    transition: all .2s ease;
    box-shadow: 0 10px 15px -3px rgba(59,130,246,.3);
  }
  .cta-btn:hover { background: #1e40af; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(59,130,246,.4); }
  .cta-btn:active { transform: scale(.98); }

  .cta-ghost {
    display: inline-flex; align-items: center; gap: .375rem;
    padding: .8125rem 1.5rem; border-radius: 9999px;
    border: 1.5px solid #d6d3d1; color: #57534e;
    font-size: .875rem; font-weight: 500; text-decoration: none;
    transition: all .2s ease;
  }
  .cta-ghost:hover { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }

  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
    padding-top: 2.5rem; border-top: 1px solid rgba(231,229,228,.8);
  }
  .stat-value { font-size: 1.5rem; font-weight: 900; color: #1c1917; }
  .stat-label { font-size: .75rem; color: #a8a29e; margin-top: .125rem; line-height: 1.25; }

  /* Mockup */
  .mockup-wrapper { position: relative; }
  .floating-badge {
    position: absolute; z-index: 20; background: white;
    border-radius: 1rem; padding: .75rem 1rem;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,.1);
    border: 1px solid #f5f5f4; display: flex; align-items: center; gap: .75rem;
  }
  .floating-badge.students { top: -1.25rem; left: -2rem; animation: float 4s ease-in-out infinite; }
  .floating-badge.attendance { bottom: -1.25rem; right: -1.5rem; animation: float 5s ease-in-out infinite; animation-delay: -2s; }
  .badge-icon {
    width: 2.25rem; height: 2.25rem; border-radius: .75rem; background: #d1fae5;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .badge-icon :global(svg) { color: #059669; }
  .badge-label { font-size: .625rem; color: #a8a29e; text-transform: uppercase; letter-spacing: .025em; }
  .badge-value { font-weight: 700; color: #1c1917; font-size: .875rem; }

  .browser-chrome {
    border-radius: 1.5rem; overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
    border: 1px solid rgba(231,229,228,.8); background: white;
  }
  .browser-bar {
    display: flex; align-items: center; gap: .5rem;
    padding: .75rem 1rem; background: #0f172a; border-bottom: 1px solid #1e293b;
  }
  .window-dot { width: .75rem; height: .75rem; border-radius: 50%; }
  .window-dot.red    { background: #f87171; }
  .window-dot.yellow { background: #fbbf24; }
  .window-dot.green  { background: #34d399; }
  .url-bar { flex: 1; display: flex; justify-content: center; }
  .url-bar span {
    padding: .25rem 1rem; border-radius: .375rem; background: #1e293b;
    color: #94a3b8; font-size: .75rem; font-family: monospace;
  }
  .app-shell { display: flex; height: 18rem; }
  .sidebar {
    width: 3.5rem; background: #0f172a;
    display: flex; flex-direction: column; align-items: center;
    padding: 1rem 0 .75rem; gap: .625rem; flex-shrink: 0;
  }
  .sidebar-icon {
    width: 2rem; height: 2rem; border-radius: .5rem;
    display: flex; align-items: center; justify-content: center; color: #64748b;
  }
  .sidebar-icon.active { background: #2563eb; color: white; }
  .dashboard-content { flex: 1; padding: 1rem; background: #f8fafc; overflow: hidden; }
  .dashboard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem; }
  .dashboard-title { font-size: .6875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
  .term-badge { font-size: .625rem; color: #94a3b8; background: white; padding: .125rem .5rem; border-radius: .375rem; border: 1px solid #e2e8f0; }
  .stat-tiles { display: grid; grid-template-columns: repeat(3,1fr); gap: .5rem; margin-bottom: .75rem; }
  .stat-tile { background: white; border-radius: .75rem; padding: .625rem; border: 1px solid rgba(226,232,240,.8); box-shadow: 0 1px 2px rgba(0,0,0,.05); }
  .tile-color { width: 1rem; height: 1rem; border-radius: .375rem; margin-bottom: .375rem; opacity: .9; }
  .tile-color.blue    { background: #3b82f6; }
  .tile-color.emerald { background: #10b981; }
  .tile-color.violet  { background: #8b5cf6; }
  .tile-value { font-size: .8125rem; font-weight: 700; color: #1e293b; line-height: 1; }
  .tile-label { font-size: .625rem; color: #94a3b8; margin-top: .125rem; }
  .quick-actions { display: grid; grid-template-columns: repeat(2,1fr); gap: .375rem; margin-bottom: .75rem; }
  .action-btn { background: white; border-radius: .5rem; border: 1px solid #e2e8f0; padding: .375rem .5rem; font-size: .625rem; font-weight: 500; color: #475569; text-align: center; }
  .skeleton-list { background: white; border-radius: .75rem; border: 1px solid #e2e8f0; overflow: hidden; }
  .skeleton-item { display: flex; align-items: center; gap: .625rem; padding: .5rem .75rem; border-bottom: 1px solid #f1f5f9; }
  .skeleton-item:last-child { border-bottom: none; }
  .skeleton-avatar { width: 1.25rem; height: 1.25rem; border-radius: 50%; background: #f1f5f9; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
  .skeleton-line { flex: 1; height: .5rem; border-radius: 9999px; background: #f1f5f9; animation: pulse 2s ease-in-out infinite; }
  .skeleton-badge { width: 2rem; height: .5rem; border-radius: 9999px; background: #dbeafe; animation: pulse 2s ease-in-out infinite; }

  /* ── Result Checker Band ─────────────────────────────────────────────────── */
  .checker-band {
    background: #0f172a;
    padding: 5rem 1.5rem;
  }
  @media (min-width: 1024px) { .checker-band { padding: 5.5rem 3.5rem; } }

  .checker-inner {
    max-width: 72rem; margin: 0 auto;
    display: grid; gap: 3.5rem; align-items: center;
  }
  @media (min-width: 1024px) { .checker-inner { grid-template-columns: 1fr 1fr; } }

  .checker-eyebrow {
    display: inline-flex; align-items: center; gap: .375rem;
    font-size: .75rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: .1em; color: #60a5fa; margin-bottom: 1rem;
  }

  .checker-heading {
    font-size: 2.25rem; font-weight: 900; color: white;
    line-height: 1.15; letter-spacing: -.02em; margin-bottom: 1rem;
  }
  @media (min-width: 1024px) { .checker-heading { font-size: 2.75rem; } }

  .checker-sub {
    color: #94a3b8; font-size: .9375rem; line-height: 1.65;
    max-width: 38ch; margin-bottom: 1.75rem;
  }

  .checker-bullets {
    list-style: none; display: flex; flex-direction: column; gap: .625rem;
    margin-bottom: 2.25rem;
  }
  .checker-bullets li {
    display: flex; align-items: center; gap: .625rem;
    color: #cbd5e1; font-size: .875rem;
  }
  .bullet-dot {
    width: .4375rem; height: .4375rem; border-radius: 50%;
    background: #3b82f6; flex-shrink: 0;
  }

  .checker-cta {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .875rem 1.875rem; border-radius: 9999px;
    background: #1d4ed8; color: white;
    font-weight: 600; font-size: .9375rem; text-decoration: none;
    transition: all .2s ease;
    box-shadow: 0 10px 15px -3px rgba(59,130,246,.35);
  }
  .checker-cta:hover { background: #1e40af; transform: translateY(-2px); }

  /* Scratch card preview */
  .card-preview-wrap { position: relative; }

  .scratch-card {
    background: linear-gradient(135deg, #1e3a6e 0%, #1d4ed8 60%, #2563eb 100%);
    border-radius: 1.25rem; padding: 1.5rem;
    box-shadow: 0 32px 64px rgba(0,0,0,.45);
    border: 1px solid rgba(255,255,255,.12);
    position: relative; overflow: hidden;
  }
  /* Decorative circles */
  .scratch-card::before {
    content: ''; position: absolute;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(255,255,255,.04); top: -60px; right: -60px;
  }
  .scratch-card::after {
    content: ''; position: absolute;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,.05); bottom: -30px; left: 1.5rem;
  }

  .sc-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 1.375rem;
  }
  .sc-logo-row { display: flex; align-items: center; gap: .5rem; }
  .sc-logo-box {
    width: 1.75rem; height: 1.75rem; border-radius: .375rem;
    background: white; color: #1d4ed8;
    display: flex; align-items: center; justify-content: center;
    font-size: .75rem; font-weight: 900;
  }
  .sc-school { color: white; font-weight: 700; font-size: .875rem; }
  .sc-label {
    font-size: .6rem; font-weight: 700; letter-spacing: .1em;
    color: rgba(255,255,255,.5); text-transform: uppercase;
    align-self: flex-end;
  }

  .sc-body { display: flex; flex-direction: column; gap: .875rem; margin-bottom: 1.25rem; position: relative; z-index: 1; }

  .sc-field { display: flex; flex-direction: column; gap: .3rem; }
  .sc-field-label { font-size: .65rem; color: rgba(255,255,255,.55); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
  .sc-field-input {
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
    border-radius: .5rem; padding: .5rem .75rem;
    color: white; font-size: .875rem; font-weight: 500;
    font-family: ui-monospace, monospace;
  }
  .sc-pin { letter-spacing: .08em; }

  .sc-go-btn {
    display: inline-flex; align-items: center; gap: .375rem;
    background: white; color: #1d4ed8;
    padding: .5rem 1.125rem; border-radius: 9999px;
    font-size: .8125rem; font-weight: 700; text-decoration: none;
    align-self: flex-start;
    transition: all .15s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,.2);
  }
  .sc-go-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(0,0,0,.25); }

  .sc-footer {
    display: flex; justify-content: space-between;
    font-size: .625rem; color: rgba(255,255,255,.35);
    border-top: 1px solid rgba(255,255,255,.1); padding-top: .75rem;
    position: relative; z-index: 1;
  }

  /* Floating result preview */
  .result-preview {
    position: absolute; bottom: -1.5rem; right: -1.5rem;
    background: white; border-radius: 1rem;
    padding: .875rem 1rem;
    box-shadow: 0 20px 40px rgba(0,0,0,.3);
    border: 1px solid #f5f5f4; width: 11rem;
    animation: float 5s ease-in-out infinite; animation-delay: -1.5s;
  }
  .rp-header { margin-bottom: .625rem; }
  .rp-name  { font-weight: 700; color: #1c1917; font-size: .8125rem; }
  .rp-class { font-size: .65rem; color: #a8a29e; margin-top: .1rem; }
  .rp-rows  { display: flex; flex-direction: column; gap: .3rem; margin-bottom: .5rem; }
  .rp-row   { display: flex; align-items: center; gap: .375rem; }
  .rp-subj  { flex: 1; font-size: .7rem; color: #57534e; }
  .rp-score { font-size: .7rem; font-weight: 600; color: #1c1917; }
  .rp-grade {
    font-size: .65rem; font-weight: 700; padding: .1rem .35rem;
    border-radius: .25rem; min-width: 1.5rem; text-align: center;
  }
  .rp-grade.grade-A { background: #dcfce7; color: #15803d; }
  .rp-grade.grade-B { background: #dbeafe; color: #1d4ed8; }
  .rp-grade.grade-C { background: #fef9c3; color: #a16207; }
  .rp-avg  { font-size: .7rem; color: #78716c; border-top: 1px solid #f5f5f4; padding-top: .375rem; }
  .rp-avg strong { color: #1c1917; }

  /* ── Features ────────────────────────────────────────────────────────────── */
  .features { padding: 6rem 1.5rem; background: #f8f6f1; }
  @media (min-width: 1024px) { .features { padding: 6rem 3.5rem; } }
  .features-container { max-width: 72rem; margin: 0 auto; }
  .section-header { text-align: center; margin-bottom: 4rem; }
  .section-subtitle { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #2563eb; margin-bottom: .75rem; }
  .section-title { font-size: 2.25rem; font-weight: 900; color: #1c1917; line-height: 1.25; }
  @media (min-width: 1024px) { .section-title { font-size: 3rem; } }
  .features-grid { display: grid; gap: 1.25rem; }
  @media (min-width: 640px)  { .features-grid { grid-template-columns: repeat(2,1fr); } }
  @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(3,1fr); } }
  .feature-card {
    background: white; border-radius: 1rem; padding: 1.5rem;
    border: 1px solid #f5f5f4; box-shadow: 0 1px 2px rgba(0,0,0,.05);
    transition: transform .25s ease, box-shadow .25s ease;
  }
  .feature-card:hover { transform: translateY(-5px); box-shadow: 0 24px 48px rgba(0,0,0,.09); }
  .feature-icon {
    width: 3rem; height: 3rem; border-radius: .75rem;
    background: #fafaf9; border: 1px solid #f5f5f4;
    display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
  }
  .feature-icon :global(svg) { color: #44403c; }
  .feature-title { font-weight: 600; color: #1c1917; margin-bottom: .5rem; font-size: .9375rem; }
  .feature-desc { font-size: .875rem; color: #78716c; line-height: 1.625; }

  /* ── Roles ───────────────────────────────────────────────────────────────── */
  .roles { padding: 5rem 1.5rem; background: #0f172a; }
  @media (min-width: 1024px) { .roles { padding: 5rem 3.5rem; } }
  .roles-container { max-width: 64rem; margin: 0 auto; text-align: center; }
  .roles-subtitle { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #60a5fa; margin-bottom: .75rem; }
  .roles-title { font-size: 2.25rem; font-weight: 900; color: white; margin-bottom: 1rem; line-height: 1.25; }
  @media (min-width: 1024px) { .roles-title { font-size: 2.5rem; } }
  .roles-description { color: #94a3b8; margin-bottom: 3.5rem; max-width: 36rem; margin-left: auto; margin-right: auto; font-size: .875rem; line-height: 1.625; }
  .roles-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; }
  @media (min-width: 640px) { .roles-grid { grid-template-columns: repeat(4,1fr); } }
  .role-card { border-radius: 1rem; padding: 1.25rem; text-align: left; border-width: 1px; border-style: solid; }
  .role-blue    { border-color: rgba(59,130,246,.4);  background: rgba(59,130,246,.1);  }
  .role-violet  { border-color: rgba(139,92,246,.4);  background: rgba(139,92,246,.1);  }
  .role-emerald { border-color: rgba(16,185,129,.4);  background: rgba(16,185,129,.1);  }
  .role-amber   { border-color: rgba(245,158,11,.4);  background: rgba(245,158,11,.1);  }
  .role-icon { margin-bottom: .75rem; color: #60a5fa; }
  .role-name { font-weight: 600; color: white; font-size: .875rem; margin-bottom: .375rem; }
  .role-desc { font-size: .75rem; color: #94a3b8; line-height: 1.375; }

  /* ── CTA section ─────────────────────────────────────────────────────────── */
  .cta-section { padding: 7rem 1.5rem; background: #f8f6f1; }
  @media (min-width: 1024px) { .cta-section { padding: 7rem 3.5rem; } }
  .cta-container { max-width: 42rem; margin: 0 auto; text-align: center; }
  .cta-icon { margin-bottom: 1.5rem; display: flex; justify-content: center; }
  .cta-icon :global(svg) { color: #a8a29e; }
  .cta-title { font-size: 2.25rem; font-weight: 900; color: #1c1917; margin-bottom: 1.25rem; line-height: 1.25; }
  @media (min-width: 1024px) { .cta-title { font-size: 3rem; } }
  .cta-text { color: #78716c; margin-bottom: 2.5rem; line-height: 1.625; }
  .cta-buttons { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
  .cta-button {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: 1rem 2.25rem; border-radius: 9999px;
    background: #1d4ed8; color: white;
    font-weight: 600; font-size: 1rem; text-decoration: none;
    transition: all .2s ease;
    box-shadow: 0 20px 25px -5px rgba(59,130,246,.3);
  }
  .cta-button:hover { background: #1e40af; transform: translateY(-4px); }
  .cta-button:active { transform: scale(.98); }
  .cta-button-ghost {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .9375rem 2rem; border-radius: 9999px;
    border: 1.5px solid #d6d3d1; color: #57534e;
    font-size: 1rem; font-weight: 500; text-decoration: none;
    transition: all .2s ease;
  }
  .cta-button-ghost:hover { border-color: #1d4ed8; color: #1d4ed8; background: #eff6ff; }

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

  /* ── Reduced motion ──────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .fade { animation: none; opacity: 1; }
    .floating-badge, .result-preview { animation: none; }
    .blob-1, .blob-2 { animation: none; }
    .pulse-dot, .skeleton-avatar, .skeleton-line, .skeleton-badge { animation: none; }
  }
</style>