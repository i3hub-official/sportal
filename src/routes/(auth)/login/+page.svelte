<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { Eye, EyeOff, AlertCircle, Building2, LogIn, Loader2, ArrowLeft } from 'lucide-svelte';

  let { form }: { form: ActionData } = $props();

  let loading = $state(false);
  let showPassword = $state(false);
</script>

<svelte:head>
  <title>Login — School Management System</title>
</svelte:head>

<div class="login-container">
  <div class="login-wrapper">
    <!-- Back to Home Button -->
    <div class="back-nav">
      <a href="/" class="back-button">
        <ArrowLeft size={16} />
        Back to Home
      </a>
    </div>

    <!-- Logo / Brand -->
    <div class="brand-section">
      <div class="logo-wrapper">
        <Building2 size={36} />
      </div>
      <h1 class="brand-title">School Management System</h1>
      <p class="brand-subtitle">Sign in to your account</p>
    </div>

    <!-- Card -->
    <div class="login-card">
      {#if form?.error}
        <div class="error-alert">
          <AlertCircle size={16} />
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            update();
          };
        }}
        class="login-form"
      >
        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            value={form?.email ?? ''}
            required
            placeholder="you@school.edu.ng"
            class="form-input"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <div class="password-header">
            <label for="password" class="form-label">
              Password
            </label>
            <a href="/forgot-password" class="forgot-link">
              Forgot Password?
            </a>
          </div>
          <div class="password-wrapper">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="form-input password-input"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="password-toggle"
              aria-label="Toggle password visibility"
            >
              {#if showPassword}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          disabled={loading}
          class="submit-btn"
        >
          {#if loading}
            <Loader2 size={16} class="spinning" />
            Signing in...
          {:else}
            <LogIn size={16} />
            Sign In
          {/if}
        </button>
      </form>
    </div>

    <p class="footer-note">
      Contact your administrator if you cannot access your account.
    </p>
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .login-container {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .login-wrapper {
    width: 100%;
    max-width: 28rem;
  }

  /* Back Navigation */
  .back-nav {
    margin-bottom: 1.5rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.15s ease;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .back-button:hover {
    background: #f1f5f9;
    color: #1e293b;
    transform: translateX(-2px);
  }

  .back-button:active {
    transform: translateX(0);
  }

  /* Brand Section */
  .brand-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: #2563eb;
    margin-bottom: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .logo-wrapper :global(svg) {
    color: white;
  }

  .brand-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  .brand-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  /* Login Card */
  .login-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    padding: 2rem;
  }

  /* Error Alert */
  .error-alert {
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .error-alert :global(svg) {
    flex-shrink: 0;
  }

  /* Form Styles */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    margin-bottom: 0.375rem;
  }

  /* Password Header with Forgot Link */
  .password-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.375rem;
  }

  .password-header .form-label {
    margin-bottom: 0;
  }

  .forgot-link {
    font-size: 0.75rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .forgot-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .form-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: 0.5rem;
    border: 1px solid #cbd5e1;
    color: #0f172a;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    background: white;
  }

  .form-input::placeholder {
    color: #94a3b8;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Password Field */
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
    color: #94a3b8;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease;
  }

  .password-toggle:hover {
    color: #475569;
  }

  /* Submit Button */
  .submit-btn {
    width: 100%;
    background: #2563eb;
    color: white;
    font-weight: 600;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .submit-btn:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:focus-visible {
    outline: none;
    ring: 2px solid #3b82f6;
    ring-offset: 2px;
  }

  .submit-btn:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Spinner Animation */
  .spinning {
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Footer Note */
  .footer-note {
    text-align: center;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 1.5rem;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .login-card {
      padding: 1.5rem;
    }

    .brand-title {
      font-size: 1.25rem;
    }

    .logo-wrapper {
      width: 3.5rem;
      height: 3.5rem;
    }

    .logo-wrapper :global(svg) {
      width: 28px;
      height: 28px;
    }

    .back-button {
      padding: 0.375rem 0.625rem;
      font-size: 0.75rem;
    }

    .forgot-link {
      font-size: 0.7rem;
    }
  }

  /* Dark mode support (optional) */
  @media (prefers-color-scheme: dark) {
    .login-container {
      background: #0f172a;
    }

    .login-card {
      background: #1e293b;
      border-color: #334155;
    }

    .brand-title {
      color: #f8fafc;
    }

    .brand-subtitle {
      color: #94a3b8;
    }

    .form-label {
      color: #cbd5e1;
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
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .password-toggle {
      color: #64748b;
    }

    .password-toggle:hover {
      color: #94a3b8;
    }

    .footer-note {
      color: #64748b;
    }

    .back-button {
      color: #94a3b8;
    }

    .back-button:hover {
      background: #334155;
      color: #f8fafc;
    }

    .forgot-link {
      color: #60a5fa;
    }

    .forgot-link:hover {
      color: #93c5fd;
    }
  }
</style>