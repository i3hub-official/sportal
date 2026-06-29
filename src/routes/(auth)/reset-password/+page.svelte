<!-- src/routes/(auth)/reset-password/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import { 
    Lock, ArrowLeft, Eye, EyeOff, AlertCircle, Shield, CheckCircle, 
    Loader2, KeyRound, AlertTriangle 
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
</script>

<svelte:head>
  <title>Reset Password — LSAI</title>
</svelte:head>

<div class="reset-container">
  <div class="reset-wrapper">
    <!-- Back to Home Button -->
    <div class="back-nav">
      <a href="/" class="back-button">
        <ArrowLeft size={16} />
        Back to Home
      </a>
    </div>

    <div class="brand-section">
      <div class="logo-wrapper">
        <Lock size={32} />
      </div>
      <h1 class="brand-title">Set New Password</h1>
      <p class="brand-subtitle">Choose a strong password for your account</p>
    </div>

    <div class="reset-card">
      {#if data.invalid}
        <div class="invalid-alert">
          <div class="invalid-icon">
            <AlertTriangle size={48} />
          </div>
          <p class="invalid-title">Link Expired or Invalid</p>
          <p class="invalid-message">This password reset link is no longer valid.</p>
          <a href="/forgot-password" class="request-link">Request a new link</a>
        </div>
      {:else}
        {#if form?.error}
          <div class="error-alert">
            <AlertCircle size={16} />
            {form.error}
          </div>
        {/if}

        {#if form?.success}
          <div class="success-alert">
            <div class="success-icon">
              <CheckCircle size={36} />
            </div>
            <p class="success-title">Password Updated!</p>
            <p class="success-message">Your password has been successfully reset.</p>
            <a href="/login" class="login-link">Proceed to Login →</a>
          </div>
        {:else}
          <form 
            method="POST" 
            use:enhance={() => {
              loading = true;
              return async ({ update }) => { 
                loading = false; 
                update(); 
              };
            }} 
            class="reset-form"
          >
            <input type="hidden" name="token" value={data.token} />

            <div class="form-group">
              <label for="password" class="form-label">New Password</label>
              <div class="password-wrapper">
                <div class="input-icon-wrapper">
                  <KeyRound size={16} class="input-icon" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'}
                    required 
                    minlength="8" 
                    placeholder="At least 8 characters" 
                    class="form-input input-with-icon password-input" 
                  />
                </div>
                <button 
                  type="button" 
                  onclick={() => showPassword = !showPassword}
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
              <p class="password-hint">Minimum 8 characters with at least one number and letter</p>
            </div>

            <div class="form-group">
              <label for="confirm" class="form-label">Confirm Password</label>
              <div class="password-wrapper">
                <div class="input-icon-wrapper">
                  <Shield size={16} class="input-icon" />
                  <input 
                    id="confirm" 
                    name="confirm" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required 
                    minlength="8" 
                    placeholder="Repeat new password" 
                    class="form-input input-with-icon password-input" 
                  />
                </div>
                <button 
                  type="button" 
                  onclick={() => showConfirmPassword = !showConfirmPassword}
                  class="password-toggle"
                  aria-label="Toggle confirm password visibility"
                >
                  {#if showConfirmPassword}
                    <EyeOff size={16} />
                  {:else}
                    <Eye size={16} />
                  {/if}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} class="submit-btn">
              {#if loading}
                <Loader2 size={16} class="spinning" />
                Updating...
              {:else}
                Update Password
              {/if}
            </button>
          </form>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .reset-container {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .reset-wrapper {
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

  /* Reset Card */
  .reset-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    padding: 2rem;
  }

  /* Invalid Alert */
  .invalid-alert {
    text-align: center;
    padding: 2rem 1rem;
  }

  .invalid-icon {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .invalid-icon :global(svg) {
    color: #f59e0b;
  }

  .invalid-title {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .invalid-message {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  .request-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .request-link:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  /* Success Alert */
  .success-alert {
    text-align: center;
    padding: 1.5rem;
    background: #ecfdf5;
    border-radius: 0.75rem;
    border: 1px solid #a7f3d0;
  }

  .success-icon {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .success-icon :global(svg) {
    color: #10b981;
  }

  .success-title {
    font-weight: 600;
    color: #065f46;
    margin-bottom: 0.25rem;
  }

  .success-message {
    font-size: 0.875rem;
    color: #047857;
    margin-bottom: 1rem;
  }

  .login-link {
    display: inline-block;
    color: #2563eb;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .login-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
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
  .reset-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

  .password-wrapper {
    position: relative;
  }

  .input-icon-wrapper {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
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

  .input-with-icon {
    padding-left: 2.25rem;
  }

  .password-input {
    padding-right: 2.5rem;
  }

  .form-input::placeholder {
    color: #94a3b8;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

  .password-hint {
    font-size: 0.7rem;
    color: #64748b;
    margin-top: 0.375rem;
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

  /* Responsive Design */
  @media (max-width: 640px) {
    .reset-card {
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
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .reset-container {
      background: #0f172a;
    }

    .reset-card {
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

    .input-icon {
      color: #64748b;
    }

    .password-toggle {
      color: #64748b;
    }

    .password-toggle:hover {
      color: #94a3b8;
    }

    .password-hint {
      color: #94a3b8;
    }

    .back-button {
      color: #94a3b8;
    }

    .back-button:hover {
      background: #334155;
      color: #f8fafc;
    }

    .invalid-title {
      color: #f8fafc;
    }

    .invalid-message {
      color: #94a3b8;
    }

    .success-alert {
      background: #064e3b;
      border-color: #065f46;
    }

    .success-title {
      color: #6ee7b7;
    }

    .success-message {
      color: #a7f3d0;
    }
  }
</style>