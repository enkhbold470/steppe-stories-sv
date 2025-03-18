<!-- src/routes/story-generator/+page.svelte -->
<script lang="ts">
    import StoryForm from '$lib/components/StoryForm.svelte';
    import StoryPreview from '$lib/components/StoryPreview.svelte';
    import StatsDisplay from '$lib/components/StatsDisplay.svelte';
    import { onMount } from 'svelte';
    import { Bot } from '@lucide/svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import type { StoryRequest } from '$lib/types';
    import type { User } from '@supabase/supabase-js';
    import { fly, fade, scale } from 'svelte/transition';
    import { elasticInOut, quintOut } from 'svelte/easing';
  
    let loading = false;
    let error = '';
    let progress = 0;
    let currentRequest: StoryRequest | null = null;
    let accumulatedContent = '';
    let totalTokens = 0;
    let totalCost = 0;
    let totalTime = 0;
    let wordCount = 0;
    let tokensPerSecond = 0;
    let user: User | null = null;
    let title = '';
    let isGenerating = false; // Track if we're in generation mode for layout
  
    // Check user authentication on mount
    onMount(async () => {
      // Using getUser instead of getSession for security (per custom instructions)
      const { data, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Authentication error:", userError);
        error = "Authentication error. Please log in again.";
        goto('/');
        return;
      }
      
      user = data.user;
      
      if (!user) {
        // Redirect to login if not authenticated
        goto('/');
      }
    });
  
    async function generateStory(request: StoryRequest) {
      try {
        loading = true;
        isGenerating = true; // Set to true when generation starts
        accumulatedContent = '';
        progress = 0;
        wordCount = 0;
        title = '';
        error = '';
        
        console.log("[FrontEnd] Starting story generation with request:", request);
        const startTime = Date.now();
        
        const response = await fetch('/api/generate', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to generate story: ${response.status} ${response.statusText}`);
        }
        
        console.log("[FrontEnd] Got response from server, starting to process stream");
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream not available');
        
        const decoder = new TextDecoder();
        let storyDone = false;
        let buffer = '';
        
        while (!storyDone) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("[FrontEnd] Stream done");
            storyDone = true;
            progress = 100;
            break;
          }
          
          const chunk = decoder.decode(value);
          console.log("[FrontEnd] Received chunk:", chunk.substring(0, 100) + "...");
          
          // Append the new chunk to our buffer
          buffer += chunk;
          
          // Split the buffer by newlines and process each complete line
          const lines = buffer.split('\n');
          
          // The last line might be incomplete, so we keep it in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines.filter(line => line.trim())) {
            try {
              console.log("[FrontEnd] Processing line:", line.substring(0, 50) + "...");
              const data = JSON.parse(line);
              
              if (data.type === 'content') {
                console.log("[FrontEnd] Adding content:", data.content.substring(0, 30) + "...");
                accumulatedContent += data.content;
                
                // Update word count
                wordCount = accumulatedContent.split(/\s+/).filter(Boolean).length;
                
                // Estimate progress based on target word count
                const targetWords = request.wordLength || 1000;
                progress = Math.min(Math.round((wordCount / targetWords) * 100), 99);
                console.log(`[FrontEnd] Progress: ${progress}%, Words: ${wordCount}`);
              } 
              else if (data.type === 'stats') {
                console.log("[FrontEnd] Received stats:", data);
                totalTokens = data.totalTokens || 0;
                totalCost = data.totalCost || 0;
                const elapsed = (Date.now() - startTime) / 1000;
                totalTime = elapsed;
                tokensPerSecond = elapsed > 0 ? Math.round(totalTokens / elapsed) : 0;
              }
              else if (data.type === 'title') {
                console.log("[FrontEnd] Received title:", data.title);
                title = data.title || 'Untitled Story';
              }
              else if (data.type === 'complete') {
                console.log("[FrontEnd] Story generation complete");
                storyDone = true;
                progress = 100;
              }
            } catch (e) {
              console.warn('[FrontEnd] Failed to parse JSON chunk:', line);
              console.error('[FrontEnd] Parse error:', e);
              
              // If parsing failed, try to recover content from plaintext
              if (line.trim() && !line.includes('{') && !line.includes('}')) {
                console.log('[FrontEnd] Treating as plain text content:', line.substring(0, 30) + "...");
                accumulatedContent += line + ' ';
                
                // Update word count
                wordCount = accumulatedContent.split(/\s+/).filter(Boolean).length;
                
                // Estimate progress
                const targetWords = request.wordLength || 1000;
                progress = Math.min(Math.round((wordCount / targetWords) * 100), 99);
              }
            }
          }
        }
        
        console.log("[FrontEnd] Story generated successfully:", { 
          titleLength: title.length,
          contentLength: accumulatedContent.length,
          wordCount,
          totalTokens,
          totalCost,
          totalTime
        });
        
        // Save the generated story to the database
        if (user && accumulatedContent) {
          await saveStoryToDatabase();
        }
        
      } catch (err) {
        console.error("[FrontEnd] Error during story generation:", err);
        error = 'Failed to generate story. Please try again.';
      } finally {
        loading = false;
        // Keep isGenerating true if we have content
        isGenerating = accumulatedContent.length > 0;
      }
    }
  
    async function saveStoryToDatabase() {
      console.log("[FrontEnd] Starting to save story to database");
      console.log("[FrontEnd] User:", user?.id);
      console.log("[FrontEnd] Content length:", accumulatedContent.length);
      console.log("[FrontEnd] Title:", title || `${currentRequest?.genre} Story`);
      
      try {
        if (!user || !accumulatedContent) {
          console.error("[FrontEnd] Cannot save story: User or content missing");
          return;
        }
        
        // Create a UUID for the story
        const storyId = crypto.randomUUID();
        console.log("[FrontEnd] Generated story ID:", storyId);
        
        // Create stats object
        const statsObj = {
          wordCount: wordCount,
          tokensUsed: totalTokens,
          generationTime: totalTime,
          tokensPerSecond: tokensPerSecond,
          cost: totalCost
        };
        console.log("[FrontEnd] Stats object:", statsObj);
        
        // Match fields to the database schema from supabaseModelCreation.sql
        const storyData = {
          story_id: storyId,
          user_id: user.id,
          title: title || `${currentRequest?.genre} Story`,
          content: accumulatedContent,
          prompt: currentRequest ? `Genre: ${currentRequest.genre}, Keywords: ${currentRequest.keywords}` : '',
          stats: statsObj,
          is_public: false
        };
        console.log("[FrontEnd] Story data prepared:", storyData);
        
        console.log("[FrontEnd] Inserting story into database...");
        const { data, error: saveError } = await supabase
          .from('stories')
          .insert(storyData)
          .select();
        
        if (saveError) {
          console.error("[FrontEnd] Database save error:", saveError);
          throw saveError;
        }
        
        console.log("[FrontEnd] Story saved successfully:", data);
        
      } catch (err: any) {
        console.error("[FrontEnd] Error saving story:", err);
        if (err.code === '23503') {
          console.error("[FrontEnd] Foreign key violation - user profile might not exist");
          // Try to create profile if it doesn't exist
          await createUserProfileIfNeeded();
          error = 'Story generated. We\'re setting up your account - please try saving again.';
        } else if (err.code === '23505') {
          console.error("[FrontEnd] Duplicate key violation - story ID already exists");
          error = 'Story generated but failed to save (duplicate ID). Try again.';
        } else {
          error = 'Story generated but failed to save to your account.';
        }
      }
    }
  
    // Helper function to create user profile if it doesn't exist
    async function createUserProfileIfNeeded() {
      if (!user) return;
      
      console.log("[FrontEnd] Attempting to create user profile");
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            username: user.email,
            subscription_status: 'free'
          });
          
        if (error) {
          console.error("[FrontEnd] Failed to create profile:", error);
        } else {
          console.log("[FrontEnd] Profile created or updated:", data);
        }
      } catch (err: any) {
        console.error("[FrontEnd] Error creating profile:", err);
      }
    }
  
    function handleGenerate(event: CustomEvent<StoryRequest>) {
      const request = event.detail;
      loading = true;
      error = '';
      currentRequest = request;
      progress = 0;
      
      generateStory(request).catch(err => {
        console.error("Error during story generation:", err);
        error = 'Failed to generate story. Please try again.';
        loading = false;
      });
    }
  
    function resetGenerator() {
      accumulatedContent = '';
      error = '';
      isGenerating = false; // Reset layout to centered
    }
  </script>
  
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto py-8 px-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-cyan-400 flex items-center justify-center gap-3">
          <Bot class="h-10 w-10" />
          Story Generator
        </h1>
        <p class="text-gray-300 mt-2 max-w-2xl mx-auto">
          Create unique stories with detailed control over genre, content, and length
        </p>
      </div>
      
      <!-- Dynamic grid layout that changes based on isGenerating state -->
      <div class="grid grid-cols-1 {isGenerating ? 'lg:grid-cols-12' : ''} gap-6">
        <!-- Parameters card - centered when not generating, moves left when generating -->
        <div class="{isGenerating ? 'lg:col-span-4' : 'max-w-xl mx-auto w-full'} 
                    transition-all duration-500 ease-in-out">
          <div class="bg-gray-800 rounded-lg shadow-lg p-6 h-full border border-gray-700
                      {isGenerating ? 'transform-none' : 'hover:shadow-cyan-900/20 hover:shadow-lg'}
                      transition-all duration-300">
            {#if !isGenerating}
              <h3 in:fade={{ duration: 300 }} 
                  class="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                <span class="mr-2">⚙️</span>
                Story Parameters
              </h3>
            {:else}
              <h3 in:fade={{ duration: 300 }} 
                  class="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                <span class="mr-2">⚙️</span>
                Story Parameters
              </h3>
            {/if}
            <StoryForm on:submit={handleGenerate} />
          </div>
        </div>
        
        <!-- Story generation content - only appears when generating -->
        {#if isGenerating}
          <div class="lg:col-span-8" 
               in:fly={{ x: 50, duration: 500, delay: 200, easing: elasticInOut }}>
            <!-- {#if loading} -->
              <div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-6 animate-fadeIn">
                <h3 class="text-xl font-semibold text-cyan-400 mb-4">Generating your story...</h3>
                
                <div class="mb-4">
                  <div class="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-cyan-600 h-2.5 rounded-full transition-all duration-300 
                                animate-pulse" 
                         style="width: {progress}%"></div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  {#if totalTokens > 0}
                    <div class="bg-gray-700 p-3 rounded animate-fadeInUp" style="animation-delay: 100ms">
                      <span class="block text-gray-400 text-sm">Words</span>
                      <span class="font-medium text-white">{wordCount}</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-fadeInUp" style="animation-delay: 200ms">
                      <span class="block text-gray-400 text-sm">Tokens~</span>
                      <span class="font-medium text-white">{totalTokens}</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-fadeInUp" style="animation-delay: 300ms">
                      <span class="block text-gray-400 text-sm">Tokens/sec~</span>
                      <span class="font-medium text-white">{tokensPerSecond}</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-fadeInUp" style="animation-delay: 400ms">
                      <span class="block text-gray-400 text-sm">Cost~</span>
                      <span class="font-medium text-white">${totalCost.toFixed(4)}</span>
                    </div>
                  {:else}
                    <div class="bg-gray-700 p-3 rounded animate-pulse">
                      <span class="block text-gray-400 text-sm">Words</span>
                      <span class="font-medium text-white">Loading...</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-pulse">
                      <span class="block text-gray-400 text-sm">Tokens~</span>
                      <span class="font-medium text-white">Loading...</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-pulse">
                      <span class="block text-gray-400 text-sm">Tokens/sec~</span>
                      <span class="font-medium text-white">Loading...</span>
                    </div>
                    <div class="bg-gray-700 p-3 rounded animate-pulse">
                      <span class="block text-gray-400 text-sm">Cost~</span>
                      <span class="font-medium text-white">Loading...</span>
                    </div>
                  {/if}
                </div>
              </div>
            <!-- {/if} -->
            
            {#if error}
              <div class="bg-red-900 text-white p-4 rounded-lg mb-6 animate-shake" in:scale={{ duration: 300 }}>
                <p>{error}</p>
              </div>
            {/if}
            
            {#if accumulatedContent}
              <div in:fade={{ duration: 500 }}>
                <StoryPreview content={accumulatedContent} title={title || `${currentRequest?.genre || ''} Story`} />
                <StatsDisplay tokens={totalTokens} cost={totalCost} time={totalTime} />
                
                <div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mt-6 animate-fadeIn">
                  <h3 class="text-xl font-semibold text-cyan-400 mb-4">Next Steps</h3>
                  <p class="text-gray-300 mb-4">
                    Your story has been saved to your account. You can view it anytime in your story history.
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <a 
                      href="/stories" 
                      class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors
                            hover:shadow-lg hover:shadow-cyan-900/30 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      View My Stories
                    </a>
                    <button 
                      on:click={resetGenerator}
                      class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded 
                            hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      Generate Another Story
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <style>
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.5s ease-in-out;
    }
    
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
  </style>