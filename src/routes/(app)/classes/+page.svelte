<!-- src/routes/(app)/classes/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { 
    School, BookOpen, Users, UserPlus, Plus, X, Check,
    GraduationCap, UserCheck, ChevronRight, AlertCircle,
    Edit2, Trash2, Settings, Clock
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showAdd = $state(false);

  const levelColor: Record<string, string> = {
    NURSERY: 'badge-purple', 
    PRIMARY: 'badge-blue', 
    SECONDARY: 'badge-green'
  };

  const levelIcon: Record<string, any> = {
    NURSERY: School,
    PRIMARY: BookOpen,
    SECONDARY: GraduationCap
  };

  const levelTitle: Record<string, string> = {
    NURSERY: 'Nursery',
    PRIMARY: 'Primary',
    SECONDARY: 'Secondary'
  };

  $effect(() => { 
    if (form?.createSuccess) showAdd = false; 
  });

  const byLevel = $derived({
    NURSERY:   data.classes.filter(c => c.level === 'NURSERY'),
    PRIMARY:   data.classes.filter(c => c.level === 'PRIMARY'),
    SECONDARY: data.classes.filter(c => c.level === 'SECONDARY'),
  });
</script>

<svelte:head>
  <title>Classes — SMS</title>
</svelte:head>

<div class="classes-container">
  <div class="classes-wrapper">
    <div class="page-header">
      <div class="header-title-section">
        <div class="title-icon">
          <School size={24} />
        </div>
        <div>
          <h1 class="page-title">Classes</h1>
          <p class="page-subtitle">
            {data.classes.length} classes · {data.academicYear?.name ?? ''}
          </p>
        </div>
      </div>
      <button onclick={() => showAdd = !showAdd} class="add-class-btn">
        {#if showAdd}
          <X size={16} />
          Cancel
        {:else}
          <Plus size={16} />
          New Class
        {/if}
      </button>
    </div>

    {#if form?.createError}
      <div class="error-alert">
        <AlertCircle size={16} />
        {form.createError}
      </div>
    {/if}

    <!-- Add class form -->
    {#if showAdd}
      <div class="add-form-card">
        <div class="card-header">
          <UserPlus size={18} />
          <h3>Add New Class</h3>
        </div>
        <div class="card-body">
          <form method="POST" action="?/create" use:enhance class="add-form">
            <div class="form-group">
              <label class="form-label">Class Name *</label>
              <input name="name" required placeholder="JSS 1C" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Level *</label>
              <select name="level" required class="form-input">
                <option value="">Select…</option>
                <option value="NURSERY">Nursery</option>
                <option value="PRIMARY">Primary</option>
                <option value="SECONDARY">Secondary</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Section</label>
              <input name="section" placeholder="A" class="form-input" />
            </div>
            <div class="form-group full-width">
              <label class="form-label">Class Teacher</label>
              <select name="classTeacherId" class="form-input">
                <option value="">— Assign later —</option>
                {#each data.staff as s}
                  <option value={s.id}>{s.firstName} {s.lastName}</option>
                {/each}
              </select>
            </div>
            <button type="submit" class="create-btn">
              <Check size={16} />
              Create Class
            </button>
          </form>
        </div>
      </div>
    {/if}

    <!-- Classes by level -->
    {#each Object.entries(byLevel) as [lvl, classes] (lvl)}
      {#if classes.length > 0}
        {@const Icon = levelIcon[lvl]}
        <div class="level-section">
          <div class="level-header">
            <Icon size={20} />
            <h2 class="level-title">{levelTitle[lvl]}</h2>
            <span class="level-count">{classes.length} classes</span>
          </div>
          
          <div class="classes-grid">
            {#each classes as cls (cls.id)}
              <div class="class-card">
                <div class="card-top">
                  <div class="class-info">
                    <p class="class-name">{cls.name}</p>
                    <p class="student-count">
                      <Users size={12} />
                      {cls._count.students} student{cls._count.students !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span class="section-badge {levelColor[cls.level]}">
                    {(cls as any).section ?? '—'}
                  </span>
                </div>

                <div class="class-teacher">
                  <UserCheck size={14} />
                  <span class="teacher-label">Class Teacher:</span>
                  <span class="teacher-name">
                    {cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 'Not assigned'}
                  </span>
                </div>

                <form method="POST" action="?/assignTeacher" use:enhance class="teacher-form">
                  <input type="hidden" name="classId" value={cls.id} />
                  <select name="classTeacherId" class="teacher-select">
                    <option value="">Remove teacher</option>
                    {#each data.staff as s (s.id)}
                      <option value={s.id} selected={s.id === cls.classTeacherId}>
                        {s.firstName} {s.lastName}
                      </option>
                    {/each}
                  </select>
                  <button type="submit" class="set-btn">
                    Set
                  </button>
                </form>

                <a href={'/classes/' + cls.id} class="view-link">
                  View Class
                  <ChevronRight size={14} />
                </a>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .classes-container {
    padding: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: #f8fafc;
  }

  .classes-wrapper {
    max-width: 80rem;
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

  .add-class-btn {
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

  .add-class-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Error Alert */
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

  /* Add Form Card */
  .add-form-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
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
    min-width: 140px;
  }

  .full-width {
    flex: 2;
    min-width: 200px;
  }

  .form-label {
    display: block;
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

  /* Level Section */
  .level-section {
    margin-bottom: 2rem;
  }

  .level-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .level-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
  }

  .level-count {
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
  }

  /* Classes Grid */
  .classes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .class-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.15s ease;
  }

  .class-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .class-info {
    flex: 1;
  }

  .class-name {
    font-weight: 700;
    font-size: 1rem;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .student-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: #64748b;
  }

  .section-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
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

  /* Class Teacher */
  .class-teacher {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    padding: 0.5rem 0;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 0.75rem;
  }

  .teacher-label {
    color: #64748b;
  }

  .teacher-name {
    color: #0f172a;
    font-weight: 500;
  }

  /* Teacher Form */
  .teacher-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .teacher-select {
    flex: 1;
    padding: 0.375rem 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    background: white;
  }

  .teacher-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .set-btn {
    padding: 0.375rem 0.75rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .set-btn:hover {
    background: #e2e8f0;
  }

  /* View Link */
  .view-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    background: #f8fafc;
    color: #2563eb;
    text-decoration: none;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .view-link:hover {
    background: #eff6ff;
    gap: 0.5rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .classes-container {
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

    .classes-grid {
      grid-template-columns: 1fr;
    }

    .level-title {
      font-size: 0.875rem;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .classes-container {
      background: #0f172a;
    }

    .page-title {
      color: #f8fafc;
    }

    .title-icon {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .add-form-card,
    .class-card {
      background: #1e293b;
      border-color: #334155;
    }

    .card-header {
      color: #f8fafc;
      border-bottom-color: #334155;
    }

    .form-input,
    .teacher-select {
      background: #1e293b;
      border-color: #475569;
      color: #f8fafc;
    }

    .form-input:focus,
    .teacher-select:focus {
      border-color: #3b82f6;
    }

    .class-name {
      color: #f8fafc;
    }

    .teacher-name {
      color: #f8fafc;
    }

    .class-teacher {
      border-top-color: #334155;
      border-bottom-color: #334155;
    }

    .set-btn {
      background: #334155;
      color: #cbd5e1;
    }

    .set-btn:hover {
      background: #475569;
    }

    .view-link {
      background: #0f172a;
    }

    .view-link:hover {
      background: #1e293b;
    }

    .level-header {
      border-bottom-color: #334155;
    }

    .level-title {
      color: #f8fafc;
    }

    .level-count {
      background: #334155;
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
  }
</style>