<!-- src/routes/story-generator/+page.svelte -->
<script lang="ts">
    import StoryForm from '$lib/components/StoryForm.svelte';
    import StoryPreview from '$lib/components/StoryPreview.svelte';
    import StatsDisplay from '$lib/components/StatsDisplay.svelte';
    import { onMount } from 'svelte';
    import { Bot } from '@lucide/svelte';
    import type { StoryRequest, GeneratedStory } from '$lib/types';
  
    let loading = false;
    let error = '';
    let progress = 0;
    let currentRequest: StoryRequest | null = null;
    let accumulatedContent = '';
    let totalTokens = 0;
    let totalCost = 0;
    let totalTime = 0;
  
    async function generateStory(request: StoryRequest) {
      try {
        loading = true;
        accumulatedContent = '';
        progress = 0;
        
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
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader?.read() ?? { done: true, value: null };
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          // Process the received chunks
          // Add to accumulatedContent and update stats
        }
      } catch (err) {
        console.error("Error during story generation:", err);
        error = 'Failed to generate story. Please try again.';
      } finally {
        loading = false;
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
  
    onMount(() => {
        console.log('onMount');
        console.log(currentRequest);
        console.log(accumulatedContent);
        console.log(totalTokens);
        console.log(totalCost);
        console.log(totalTime);
        console.log(progress);
        console.log(loading);
        console.log(error);
        console.log(currentRequest);
        console.log(accumulatedContent);
        console.log(totalTokens);
        console.log(totalCost);
        console.log(totalTime);
        console.log(progress);
        console.log(loading);
        console.log(error);

      // Any initialization code
    });
  </script>
  
  <div class="min-vh-100" style="background: #000;">
    <div class="container py-5">
      <div class="text-center mb-5">
        <h1 style="
          font-size: 3.5rem;
          color: #00f3ff;
          text-shadow: 0 0 20px rgba(0, 243, 255, 0.5), 0 0 40px rgba(0, 243, 255, 0.3);
          font-weight: bold"
        >
          <Bot class="me-3" style="filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.5));" />
          Story Generator
        </h1>
        <p style="
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.25rem;
          max-width: 700px;
          margin: 0 auto;
          margin-top: 1rem"
        >
          Create unique stories powered by Anthropic, offering up to 60,000 words at a time
        </p>
      </div>
      
      <div class="row g-4">
        <div class="col-lg-4">
          <div class="h-100" style="
            padding: 2rem;
            background: rgba(13, 13, 17, 0.95);
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px)"
          >
            <h4 class="mb-4" style="
              color: #00f3ff;
              text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
              display: flex;
              align-items: center"
            >
              <span class="me-2">⚙️</span>
              Story Parameters
            </h4>
            <StoryForm on:submit={handleGenerate} />
          </div>
        </div>
        
        <div class="col-lg-8">
          {#if loading}
            <div class="mb-4" style="
              padding: 2rem;
              background: rgba(13, 13, 17, 0.95);
              border-radius: 1rem;
              border: 1px solid rgba(255, 255, 255, 0.1)"
            >
              <h4 style="color: #00f3ff">Generating your story...</h4>
              <div class="progress mt-3">
                <div 
                  class="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  style="width: {progress}%" 
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          {/if}
          
          {#if error}
            <div class="alert alert-danger">{error}</div>
          {/if}
          
          {#if accumulatedContent}
            <StoryPreview content={accumulatedContent} />
            <StatsDisplay tokens={totalTokens} cost={totalCost} time={totalTime} />
          {/if}
        </div>
      </div>
    </div>
  </div>