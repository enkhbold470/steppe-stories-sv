<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import type { User } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  
  let user: User | null = null;
  let loading = true;
  let error = '';
  let createdAt = '';
  
  onMount(async () => {
    try {
      loading = true;
      
      // Following the recommended practice in custom instructions
      // Use getUser() instead of getSession() for server-side security
      const { data, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!data.user) {
        // Redirect to login if not authenticated
        goto('/');
        return;
      }
      
      user = data.user;
      
      // Format the creation date
      if (user.created_at) {
        const date = new Date(user.created_at);
        createdAt = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = 'An unknown error occurred';
      }
    } finally {
      loading = false;
    }
  });
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    goto('/');
  };
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-cyan-400 mb-8">User Profile</h1>
  
  {#if loading}
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
      <div class="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
      <div class="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
      <div class="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
    </div>
  {:else if error}
    <div class="bg-red-900 text-white p-4 rounded-lg mb-4">
      <p>{error}</p>
    </div>
  {:else if user}
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-200">Account Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-400 text-sm mb-1">User UUID</p>
            <p class="text-white font-mono bg-gray-700 p-2 rounded text-sm overflow-x-auto">{user.id}</p>
          </div>
          
          <div>
            <p class="text-gray-400 text-sm mb-1">Email</p>
            <p class="text-white font-medium">{user.email}</p>
          </div>
          
          <div>
            <p class="text-gray-400 text-sm mb-1">Account Created</p>
            <p class="text-white">{createdAt || 'N/A'}</p>
          </div>

          

          <div>
            <p class="text-gray-400 text-sm mb-1">Role</p>
            <p class="text-white">{user.role || 'N/A'}</p>
          </div>

          <div>
            <p class="text-gray-400 text-sm mb-1">Last Sign In</p>
            <p class="text-white">{user.last_sign_in_at || 'N/A'}</p>
          </div>

          <div>
            <p class="text-gray-400 text-sm mb-1">Updated At</p>
            <p class="text-white">{user.updated_at || 'N/A'}</p>
          </div>
          
        </div>
      </div>
      
      <div class="pt-4 border-t border-gray-700">
        <button 
          on:click={handleSignOut}
          class="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-lg text-gray-400">You need to be signed in to view your profile.</p>
      <a href="/" class="mt-4 inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors">
        Sign In
      </a>
    </div>
  {/if}
</div> 