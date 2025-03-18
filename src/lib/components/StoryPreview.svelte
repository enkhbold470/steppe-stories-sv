<!-- src/lib/components/StoryPreview.svelte -->
<script lang="ts">
    export let content = '';
    export let title = 'Generated Story';

    function downloadStory() {
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }

    function copyToClipboard() {
      navigator.clipboard.writeText(content)
        .then(() => {
          // Show copy success feedback
          const copyBtn = document.getElementById('copy-btn');
          if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
</script>
  
<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold text-cyan-400 flex items-center">
      <span class="mr-2">📖</span>
      Your Generated Story
    </h3>
    <div class="flex gap-2">
      <button 
        id="copy-btn"
        on:click={copyToClipboard}
        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center"
        aria-label="Copy story to clipboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy
      </button>
      <button 
        on:click={downloadStory}
        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center"
        aria-label="Download story as markdown"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>
    </div>
  </div>
  
  <div class="text-gray-100 whitespace-pre-wrap leading-relaxed">
    {content}
  </div>
</div>