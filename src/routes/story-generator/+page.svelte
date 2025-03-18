<!-- src/routes/story-generator/+page.svelte -->
<script lang="ts">
    import StoryForm from '$lib/components/StoryForm.svelte';
    import StoryPreview from '$lib/components/StoryPreview.svelte';
    import StatsDisplay from '$lib/components/StatsDisplay.svelte';
    import { onMount } from 'svelte';
    import { Bot } from '@lucide/svelte';
    import { supabase } from '$lib/supabaseClient';
    import { goto } from '$app/navigation';
    import type { StoryRequest, GeneratedStory } from '$lib/types';
    import type { User } from '@supabase/supabase-js';
  
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
        accumulatedContent = '';
        progress = 0;
        wordCount = 0;
        title = '';
        
        const startTime = Date.now();
        
        const response = await fetch('/api/generate', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate story');
        }
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Stream not available');
        
        const decoder = new TextDecoder();
        let storyDone = false;
        
        while (!storyDone) {
          const { done, value } = await reader.read();
          
          if (done) {
            storyDone = true;
            progress = 100;
            break;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'content') {
                accumulatedContent += data.content;
                
                // Update word count
                wordCount = accumulatedContent.split(/\s+/).filter(Boolean).length;
                
                // Estimate progress based on target word count
                const targetWords = request.wordLength || 1000;
                progress = Math.min(Math.round((wordCount / targetWords) * 100), 99);
              } 
              else if (data.type === 'stats') {
                totalTokens = data.totalTokens || 0;
                totalCost = data.cost || 0;
                const elapsed = (Date.now() - startTime) / 1000;
                totalTime = elapsed;
                tokensPerSecond = elapsed > 0 ? Math.round(totalTokens / elapsed) : 0;
              }
              else if (data.type === 'title') {
                title = data.title || 'Untitled Story';
              }
              else if (data.type === 'complete') {
                storyDone = true;
                progress = 100;
              }
            } catch (e) {
              console.warn('Failed to parse JSON chunk:', line, e);
            }
          }
        }
        
        // Save the generated story to the database
        if (user && accumulatedContent) {
          await saveStoryToDatabase();
        }
        
      } catch (err) {
        console.error("Error during story generation:", err);
        error = 'Failed to generate story. Please try again.';
      } finally {
        loading = false;
      }
    }
  
    async function saveStoryToDatabase() {
      try {
        if (!user || !accumulatedContent) return;
        
        const { error: saveError } = await supabase
          .from('stories')
          .insert({
            user_id: user.id,
            title: title || `${currentRequest?.genre} Story`,
            content: accumulatedContent,
            word_count: wordCount,
            tokens_used: totalTokens,
            cost: totalCost
          });
        
        if (saveError) throw saveError;
        
      } catch (err) {
        console.error("Error saving story:", err);
        error = 'Story generated but failed to save to your account.';
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
  </script>
  
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto py-8 px-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-cyan-400 flex items-center justify-center gap-3">
          <Bot class="h-10 w-10" />
          Story Generator
        </h1>
        <p class="text-gray-300 mt-2 max-w-2xl mx-auto">
          Create unique AI-powered stories with detailed control over genre, content, and length
        </p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4">
          <div class="bg-gray-800 rounded-lg shadow-lg p-6 h-full border border-gray-700">
            <h3 class="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
              <span class="mr-2">⚙️</span>
              Story Parameters
            </h3>
            <StoryForm on:submit={handleGenerate} />
          </div>
        </div>
        
        <div class="lg:col-span-8">
          {#if loading}
            <div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-6">
              <h3 class="text-xl font-semibold text-cyan-400 mb-4">Generating your story...</h3>
              
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2.5">
                  <div class="bg-cyan-600 h-2.5 rounded-full transition-all duration-300" style="width: {progress}%"></div>
                </div>
              </div>
              
              {#if wordCount > 0}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div class="bg-gray-700 p-3 rounded">
                    <span class="block text-gray-400 text-sm">Words</span>
                    <span class="font-medium text-white">{wordCount.toLocaleString()}</span>
                  </div>
                  <div class="bg-gray-700 p-3 rounded">
                    <span class="block text-gray-400 text-sm">Tokens</span>
                    <span class="font-medium text-white">{totalTokens.toLocaleString()}</span>
                  </div>
                  <div class="bg-gray-700 p-3 rounded">
                    <span class="block text-gray-400 text-sm">Tokens/sec</span>
                    <span class="font-medium text-white">{tokensPerSecond.toLocaleString()}</span>
                  </div>
                  <div class="bg-gray-700 p-3 rounded">
                    <span class="block text-gray-400 text-sm">Cost</span>
                    <span class="font-medium text-white">${totalCost.toFixed(4)}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
          
          {#if error}
            <div class="bg-red-900 text-white p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          {/if}
          
          {#if accumulatedContent}
            <StoryPreview content={accumulatedContent} title={title || `${currentRequest?.genre || ''} Story`} />
            <StatsDisplay tokens={totalTokens} cost={totalCost} time={totalTime} />
            
            <div class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mt-6">
              <h3 class="text-xl font-semibold text-cyan-400 mb-4">Next Steps</h3>
              <p class="text-gray-300 mb-4">
                Your story has been saved to your account. You can view it anytime in your story history.
              </p>
              <div class="flex flex-wrap gap-3">
                <a 
                  href="/stories" 
                  class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                >
                  View My Stories
                </a>
                <button 
                  on:click={() => {
                    accumulatedContent = '';
                    error = '';
                  }}
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Generate Another Story
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>