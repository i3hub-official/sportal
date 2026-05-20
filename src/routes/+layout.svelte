<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import './layout.css';
  import type { LayoutData } from './$types';
  import { userStore } from '$lib/stores/user.svelte';

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Sync server-loaded user into the client store
  $effect(() => {
    userStore.set(data.user ?? null);
  });
</script>

{@render children()}
