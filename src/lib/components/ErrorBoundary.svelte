<!-- src/lib/components/ErrorBoundary.svelte -->
<script lang="ts">
  let { children } = $props();
  let error = $state<Error | null>(null);
  let isOffline = $state(false);

  // Check online status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOffline = false;
      window.location.reload();
    });
    window.addEventListener('offline', () => {
      isOffline = true;
    });
    
    // Initial check
    isOffline = !navigator.onLine;
  }

  function handleError(e: ErrorEvent) {
    error = e.error;
    console.error('Caught error:', error);
    e.preventDefault();
  }

  function reload() {
    window.location.reload();
  }

  function goHome() {
    window.location.href = '/';
  }
</script>

<svelte:window onerror={handleError} />

{#if error}
  <div class="error-boundary">
    <div class="error-icon">⚠️</div>
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <div class="button-group">
      <button onclick={reload} class="btn-primary">Try Again</button>
      <button onclick={goHome} class="btn-secondary">Go Home</button>
    </div>
  </div>
{:else if isOffline}
  <div class="error-boundary">
    <div class="error-icon">🌐</div>
    <h2>No Internet Connection</h2>
    <p>Please check your network connection and try again.</p>
    <div class="button-group">
      <button onclick={() => window.location.reload()} class="btn-primary">Retry</button>
      <button onclick={goHome} class="btn-secondary">Go Home</button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .error-boundary {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  }
  
  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease-in-out infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
  
  .button-group {
    display: flex;
    gap: 0.75rem;
  }
  
  .btn-primary {
    padding: 0.5rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.15s;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .btn-secondary {
    padding: 0.5rem 1.5rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.15s;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }
  
  @media (max-width: 640px) {
    .button-group {
      flex-direction: column;
    }
  }
</style>