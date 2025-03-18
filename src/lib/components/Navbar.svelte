<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Session, User } from '@supabase/supabase-js';
  
  let session: Session | null = null;
  let user: User | null = null;
  let isOpen = false;

  // Define menu items
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Story Generator', path: '/story-generator', requiresAuth: true },
    { name: 'My Stories', path: '/stories', requiresAuth: true },
  ];
  
  onMount(async () => {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    supabase.auth.onAuthStateChange((_event, _session) => {
      session = _session;
    });
  });
  
  const toggleNavbar = () => {
    isOpen = !isOpen;
  };
  
  const handleSignOut = async () => {
    const confirmSignOut = confirm("Are you sure you want to sign out?");
    if (confirmSignOut) {
      await supabase.auth.signOut();
      goto('/');
    }
  };
</script>

<nav class="bg-gray-900 text-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 text-cyan-400 font-bold text-xl">
          Steppe Stories
        </a>
        <div class="hidden md:block ml-10">
          <div class="flex items-center space-x-4">
            {#each menuItems as item}
              {#if !item.requiresAuth || session}
                <a 
                  href={item.path} 
                  class={$page.url.pathname === item.path ? 
                    'bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium' : 
                    'text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'}
                >
                  {item.name}
                </a>
              {/if}
            {/each}
          </div>
        </div>
      </div>
      <div class="hidden md:block">
        <div class="ml-4 flex items-center md:ml-6 gap-4">
          {#if session}
        
            <a href="/profile" class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Profile</a>
            <button 
            on:click={handleSignOut}
            class="bg-red-950 hover:bg-red-900 px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Sign Out
          </button>
          {:else}
            <a 
              href="/" 
              class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              Sign In
            </a>
          {/if}
        </div>
      </div>
      <div class="-mr-2 flex md:hidden">
        <button 
          on:click={toggleNavbar}
          class="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white cursor-pointer"
        >
          <span class="sr-only">Open main menu</span>
          <!-- Icon for hamburger menu -->
          <svg class={!isOpen ? 'block h-6 w-6' : 'hidden h-6 w-6'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Icon for X menu -->
          <svg class={isOpen ? 'block h-6 w-6' : 'hidden h-6 w-6'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu, show/hide based on menu state -->
  <div class={isOpen ? 'block md:hidden' : 'hidden md:hidden'}>
    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      {#each menuItems as item}
        {#if !item.requiresAuth || session}
          <a 
            href={item.path} 
            class={$page.url.pathname === item.path ? 
              'bg-gray-800 text-white block px-3 py-2 rounded-md text-base font-medium' : 
              'text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium'}
          >
            {item.name}
          </a>
        {/if}
      {/each}
      {#if session}
        <button 
          on:click={handleSignOut}
          class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left cursor-pointer"
        >
          Sign Out
        </button>
      {:else}
        <a 
          href="/" 
          class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
        >
          Sign In
        </a>
      {/if}
    </div>
  </div>
</nav> 