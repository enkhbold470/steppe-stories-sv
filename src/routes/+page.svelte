<script lang="ts">
    import { onMount } from 'svelte'
    import { supabase } from '$lib/supabaseClient'
    import type { AuthSession } from '@supabase/supabase-js'
    import { goto } from '$app/navigation'
    import { Bot, Sparkles, FileText, Users } from '@lucide/svelte'
    
    let session: AuthSession | null = null
    let isLoading = false; // Track loading state
  
    onMount(() => {
      supabase.auth.getSession().then(({ data }) => {
        session = data.session
        
        // If user is logged in, redirect to story generator
        if (session) {
          goto('/story-generator')
        }
      })
  
      supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session
      })
    })
    
    // Handle magic link login
    const handleLogin = async () => {
      const email = (document.getElementById('email') as HTMLInputElement)?.value
      if (!email) return
      
      isLoading = true; // Set loading state to true
      
      try {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        alert('Check your email for login link!')
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        isLoading = false; // Reset loading state
      }
    }
</script>

<div class="bg-gray-900 min-h-screen">
  <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <div class="py-16 text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-cyan-400 mb-4">
        <span class="inline-block">Steppe</span>
        <span class="inline-block">Stories</span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Create unique stories and novels with detailed control over genre, content, and length
      </p>
      
      <div class="bg-gradient-to-r from-cyan-700 to-blue-900 p-8 rounded-xl shadow-2xl max-w-xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-4">Sign In to Start Creating</h2>
        <p class="text-gray-200 mb-4">Enter your email to receive a magic link</p>
        
        <div class="space-y-4">
          <input 
            id="email"
            type="email" 
            placeholder="Your email address" 
            class="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {#if isLoading}
            <button 
              class="w-full cursor-progress bg-gray-600 text-white font-bold py-3 px-4 rounded-md shadow-lg transition-all duration-200"
            >
              Sending magic link...
            </button>
          {:else}
            <button 
              on:click={handleLogin}
              class="w-full bg-gradient-to-r from-cyan-500 to-cyan-300 hover:from-cyan-400 hover:to-cyan-200 text-gray-900 font-bold py-3 px-4 rounded-md shadow-lg transition-all duration-200 cursor-pointer"
            >
              Get Magic Link
            </button>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Features Section -->
    <div class="py-16">
      <h2 class="text-3xl font-bold text-center text-white mb-12">Why Choose Steppe Stories?</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div class="flex items-center mb-4">
            <Bot class="h-8 w-8 text-cyan-400 mr-3" />
            <h3 class="text-xl font-semibold text-white">Novel Generation</h3>
          </div>
          <p class="text-gray-300">
            Leverage advanced novel generation to create detailed, imaginative stories tailored to your preferences.
          </p>
        </div>
        
        <!-- Feature 2 -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div class="flex items-center mb-4">
            <Sparkles class="h-8 w-8 text-cyan-400 mr-3" />
            <h3 class="text-xl font-semibold text-white">Customizable Stories</h3>
          </div>
          <p class="text-gray-300">
            Control the genre, tone, style, and length of your stories with easy-to-use options.
          </p>
        </div>
        
        <!-- Feature 3 -->
        <div class="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div class="flex items-center mb-4">
            <FileText class="h-8 w-8 text-cyan-400 mr-3" />
            <h3 class="text-xl font-semibold text-white">Save & Export</h3>
          </div>
          <p class="text-gray-300">
            Keep all your generated stories in one place, with options to download or copy for use elsewhere.
          </p>
        </div>
      </div>
    </div>
    
    <!-- How It Works Section -->
    <div class="py-16">
      <h2 class="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
      
      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Step 1 -->
          <div class="flex mb-12">
            <div class="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-gray-900 font-bold mr-6 flex-shrink-0 z-10">
              1
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white mb-2">Sign in with magic link</h3>
              <p class="text-gray-300">
                No passwords required - just enter your email and click the link we send you.
              </p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex mb-12">
            <div class="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-gray-900 font-bold mr-6 flex-shrink-0 z-10">
              2
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white mb-2">Customize your story parameters</h3>
              <p class="text-gray-300">
                Choose genre, length, tone, and add keywords to guide the AI generation.
              </p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex">
            <div class="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-gray-900 font-bold mr-6 flex-shrink-0 z-10">
              3
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white mb-2">Generate and enjoy your story</h3>
              <p class="text-gray-300">
                Watch as the AI crafts your unique story in real-time, then save, download or share it.
              </p>
            </div>
          </div>
          
          <!-- Connecting Line -->
          <div class="absolute left-6 top-12 w-0.5 h-[calc(100%-48px)] bg-cyan-800" style="transform: translateX(-50%);"></div>
        </div>
      </div>
    </div>
  </div>
</div>