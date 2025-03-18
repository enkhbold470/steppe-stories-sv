<!-- src/lib/components/StoryPreview.svelte -->
<script lang="ts">
    import { WandSparkles, Copy, Download } from '@lucide/svelte';
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

      <WandSparkles class="h-4 w-4 mr-1" />
      Your Generated Story
    </h3>
    <div class="flex gap-2">
      <button 
        id="copy-btn"
        on:click={copyToClipboard}
        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center cursor-pointer"
        aria-label="Copy story to clipboard"
      >
        <Copy class="h-4 w-4 mr-1" />
        Copy
      </button>
      <button 
        on:click={downloadStory}
        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center cursor-pointer"
        aria-label="Download story as markdown"
      >
        <Download class="h-4 w-4 mr-1" />
        Download
      </button>
    </div>
  </div>
  
  <div class="text-gray-100 whitespace-pre-wrap leading-relaxed">
    {content}
  </div>
</div>