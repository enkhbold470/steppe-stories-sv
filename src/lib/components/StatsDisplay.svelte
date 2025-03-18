<!-- src/lib/components/StatsDisplay.svelte -->
<script lang="ts">
    export let tokens = 0;
    export let cost = 0;
    export let time = 0;
  </script>
  
  <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
    <h3 class="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
      <span class="mr-2">📊</span>
      Generation Stats
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gray-700 p-3 rounded">
        <div class="text-gray-400 text-sm">Tokens Used</div>
        <div class="text-white text-lg font-medium">{tokens.toLocaleString()}</div>
      </div>
      
      <div class="bg-gray-700 p-3 rounded">
        <div class="text-gray-400 text-sm">Estimated Cost</div>
        <div class="text-white text-lg font-medium">${cost.toFixed(4)}</div>
      </div>
      
      <div class="bg-gray-700 p-3 rounded">
        <div class="text-gray-400 text-sm">Generation Time</div>
        <div class="text-white text-lg font-medium">{time.toFixed(2)}s</div>
      </div>
    </div>
  </div>