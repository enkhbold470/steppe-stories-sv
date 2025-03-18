<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import type { User } from '@supabase/supabase-js';
  import { marked } from 'marked';
  import type { Story } from '$lib/types';
  
  let stories: Story[] = [];
  let loading = true;
  let error = '';
  let user: User | null = null;
  let selectedStory: Story | null = null;
  let previewHtml = '';
  
  onMount(async () => {
    try {
      loading = true;
      
      // Get the authenticated user - following custom instruction
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!userData.user) {
        // Redirect to login if not authenticated
        goto('/');
        return;
      }
      
      user = userData.user;
      
      // Get the user's stories
      const { data, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log(data);
      
      if (storiesError) throw storiesError;
      
      stories = data || [];
      
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
  
  async function showPreview(story: Story) {
    selectedStory = story;
    try {
      previewHtml = await marked.parse(story.content);
    } catch (e) {
      console.error("Error parsing markdown:", e);
      previewHtml = `<p>Error rendering markdown. Please try again.</p>`;
    }
  }
  
  function closePreview() {
    selectedStory = null;
    previewHtml = '';
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      alert('Story copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  function downloadMarkdown(story: Story) {
    const blob = new Blob([story.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-cyan-400 mb-8">My Stories</h1>
  
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
  {:else if stories.length === 0}
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
      <p class="text-lg text-gray-400 mb-4">You haven't generated any stories yet.</p>
      <a 
        href="/story-generator" 
        class="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
      >
        Create Your First Story
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-6">
      {#each stories as story}
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="flex flex-col md:flex-row justify-between mb-4">
            <h2 class="text-xl font-semibold text-white mb-2 md:mb-0">{story.title}</h2>
            <div class="text-gray-400 text-sm">{formatDate(story.created_at)}</div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div class="bg-gray-700 p-3 rounded">
              <span class="block text-gray-400">Words</span>
              <span class="font-medium text-white">{story.stats.wordCount}</span>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <span class="block text-gray-400">Tokens Used</span>
              <span class="font-medium text-white">{story.stats.tokensUsed}</span>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <span class="block text-gray-400">Cost</span>
              <span class="font-medium text-white">${story.stats.cost.toFixed(4)}</span>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button 
              on:click={() => showPreview(story)}
              class="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm rounded transition-colors"
            >
              View Story
            </button>
            <button 
            on:click={() => selectedStory && downloadMarkdown(selectedStory)}
            class="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm rounded transition-colors"
          >
            Download MD
          </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  {#if selectedStory}
    <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-medium text-white">{selectedStory.title}</h3>
          <button 
            on:click={closePreview}
            class="text-gray-400 hover:text-white"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-grow">
          <!-- Using the prose class from @tailwindcss/typography for better markdown styling -->
          <div class="prose prose-invert prose-sm md:prose-base max-w-none">
            {@html previewHtml}
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-700 flex justify-between">
          <button 
            on:click={() => copyToClipboard(selectedStory?.content || '')}
            class="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm rounded transition-colors"
          >
            Copy Text
          </button>
          
        </div>
      </div>
    </div>
  {/if}
</div> 