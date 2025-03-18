<!-- src/lib/components/StoryForm.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { WandSparkles } from '@lucide/svelte';
  
    const dispatch = createEventDispatcher();
    
    let genre = '';
    let keywords = '';
    let wordLength = 1000;
  
    function handleSubmit() {
      dispatch('submit', {
        genre,
        keywords,
        wordLength
      });
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-3">
      <label for="genre" class="form-label" style="color: rgba(255, 255, 255, 0.7)">
        Genre
      </label>
      <select 
        id="genre" 
        bind:value={genre}
        class="form-select" 
        style="background: rgba(30, 30, 40, 0.95); color: white; border: 1px solid rgba(255, 255, 255, 0.2);"
        required
      >
        <option value="">Select genre</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Science Fiction">Science Fiction</option>
        <option value="Mystery">Mystery</option>
        <option value="Horror">Horror</option>
        <option value="Romance">Romance</option>
        <option value="Adventure">Adventure</option>
      </select>
    </div>
    
    <div class="mb-3">
      <label for="keywords" class="form-label" style="color: rgba(255, 255, 255, 0.7)">
        Keywords/Prompt
      </label>
      <textarea 
        id="keywords" 
        bind:value={keywords}
        class="form-control" 
        style="background: rgba(30, 30, 40, 0.95); color: white; border: 1px solid rgba(255, 255, 255, 0.2);" 
        rows="3" 
        placeholder="Enter keywords or a brief prompt"
        required
      ></textarea>
    </div>
    
    <div class="mb-4">
      <label for="wordLength" class="form-label" style="color: rgba(255, 255, 255, 0.7)">
        Word Count: {wordLength}
      </label>
      <input 
        type="range" 
        class="form-range" 
        id="wordLength" 
        bind:value={wordLength}
        min="500" 
        max="5000" 
        step="500"
      >
    </div>
    
    <button 
      type="submit" 
      style="
        background: linear-gradient(90deg, #007bff, #00f3ff);
        border: none;
        color: #000;
        font-weight: bold;
        padding: 1rem;
        border-radius: 0.5rem;
        width: 100%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center"
    >
      <WandSparkles class="me-2" />
      Generate Story
    </button>
  </form>