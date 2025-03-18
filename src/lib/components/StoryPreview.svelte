<!-- src/lib/components/StoryPreview.svelte -->
<script>
    export let content = '';
  </script>
  
  <div style="
    background: rgba(13, 13, 17, 0.95);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem;
    margin-bottom: 1.5rem"
  >
    <h4 style="
      color: #00f3ff;
      text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
      margin-bottom: 1.5rem"
    >
      <span class="me-2">📖</span>
      Your Generated Story
    </h4>
    
    <div style="
      color: rgba(255, 255, 255, 0.9);
      white-space: pre-wrap;
      line-height: 1.8;
      font-size: 1.05rem"
    >
      {content}
    </div>
  </div>