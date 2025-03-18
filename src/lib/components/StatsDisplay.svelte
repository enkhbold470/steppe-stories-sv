<!-- src/lib/components/StatsDisplay.svelte -->
<script>
    export let tokens = 0;
    export let cost = 0;
    export let time = 0;
  </script>
  
  <div style="
    background: rgba(13, 13, 17, 0.95);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem"
  >
    <h5 style="color: #00f3ff; margin-bottom: 1rem">
      <span class="me-2">📊</span>
      Generation Stats
    </h5>
    
    <div class="row">
      <div class="col-md-4 mb-3">
        <div style="color: rgba(255, 255, 255, 0.7)">Tokens Used</div>
        <div style="color: white; font-size: 1.25rem; font-weight: 500">{tokens.toLocaleString()}</div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div style="color: rgba(255, 255, 255, 0.7)">Estimated Cost</div>
        <div style="color: white; font-size: 1.25rem; font-weight: 500">${cost.toFixed(4)}</div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div style="color: rgba(255, 255, 255, 0.7)">Generation Time</div>
        <div style="color: white; font-size: 1.25rem; font-weight: 500">{time.toFixed(2)}s</div>
      </div>
    </div>
  </div>