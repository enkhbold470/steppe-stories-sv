<!-- src/lib/components/StoryForm.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { WandSparkles } from '@lucide/svelte';
  
    const dispatch = createEventDispatcher();
    
    let genre = '';
    let keywords = '';
    let wordLength = 1000;
    let selectedTone = '';
    let selectedPOV = '';
    let selectedStyle = '';
  
    // Predefined options for various attributes
    const toneOptions = [
      { value: '', label: 'Select tone' },
      { value: 'humorous', label: 'Humorous' },
      { value: 'dark', label: 'Dark' },
      { value: 'whimsical', label: 'Whimsical' },
      { value: 'serious', label: 'Serious' },
      { value: 'nostalgic', label: 'Nostalgic' },
      { value: 'optimistic', label: 'Optimistic' }
    ];
  
    const povOptions = [
      { value: '', label: 'Select POV' },
      { value: 'first_person', label: 'First Person' },
      { value: 'second_person', label: 'Second Person' },
      { value: 'third_person', label: 'Third Person' },
      { value: 'omniscient', label: 'Omniscient' }
    ];
  
    const styleOptions = [
      { value: '', label: 'Select style' },
      { value: 'descriptive', label: 'Descriptive' },
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'poetic', label: 'Poetic' },
      { value: 'dialogue_heavy', label: 'Dialogue Heavy' },
      { value: 'action_focused', label: 'Action Focused' }
    ];
  
    function handleSubmit() {
      // Build enhanced prompt with selected options
      let enhancedKeywords = keywords;
      
      if (selectedTone) {
        enhancedKeywords += ` Use a ${selectedTone} tone.`;
      }
      
      if (selectedPOV) {
        const povText = selectedPOV === 'first_person' ? 'first person' :
                        selectedPOV === 'second_person' ? 'second person' :
                        selectedPOV === 'third_person' ? 'third person' : 'omniscient';
        enhancedKeywords += ` Write in ${povText} perspective.`;
      }
      
      if (selectedStyle) {
        const styleText = selectedStyle.replace('_', ' ');
        enhancedKeywords += ` Use a ${styleText} writing style.`;
      }
      
      dispatch('submit', {
        genre,
        keywords: enhancedKeywords,
        wordLength
      });
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="genre" class="block text-gray-300 text-sm mb-2">
        Genre
      </label>
      <select 
        id="genre" 
        bind:value={genre}
        class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
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
    
    <div>
      <label for="keywords" class="block text-gray-300 text-sm mb-2">
        Keywords/Prompt
      </label>
      <textarea 
        id="keywords" 
        bind:value={keywords}
        class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-cyan-500 focus:border-cyan-500" 
        rows="3" 
        placeholder="Enter keywords or a brief prompt"
        required
      ></textarea>
    </div>
    
    <!-- Additional options -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="tone" class="block text-gray-300 text-sm mb-2">
          Tone
        </label>
        <select 
          id="tone" 
          bind:value={selectedTone}
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
        >
          {#each toneOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="pov" class="block text-gray-300 text-sm mb-2">
          Point of View
        </label>
        <select 
          id="pov" 
          bind:value={selectedPOV}
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
        >
          {#each povOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="style" class="block text-gray-300 text-sm mb-2">
          Writing Style
        </label>
        <select 
          id="style" 
          bind:value={selectedStyle}
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
        >
          {#each styleOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div>
      <label for="wordLength" class="block text-gray-300 text-sm mb-2">
        Word Count: {wordLength}
      </label>
      <input 
        type="range" 
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
        id="wordLength" 
        bind:value={wordLength}
        min="500" 
        max="5000" 
        step="500"
      >
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>500</span>
        <span>5000</span>
      </div>
    </div>
    
    <button 
      type="submit" 
      class="w-full bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-gray-900 font-bold py-3 px-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
    >
      <WandSparkles class="mr-2 h-5 w-5" />
      Generate Story
    </button>
  </form>