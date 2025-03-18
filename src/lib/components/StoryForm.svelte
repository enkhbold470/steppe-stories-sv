<!-- src/lib/components/StoryForm.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { WandSparkles, Info } from '@lucide/svelte';
  
    const dispatch = createEventDispatcher();
    
    let genre = '';
    let keywords = '';
    let wordLength = 1000;
    let selectedTone = '';
    let selectedPOV = '';
    let selectedStyle = '';
    let selectedTags: string[] = []; // New variable for selected tags
    let isGenerating = false; // Track generation state
  
    // Predefined options for various attributes
    const toneOptions = [
      { value: '', label: 'Select tone' },
      { value: 'humorous', label: 'Humorous' },
      { value: 'dark', label: 'Dark' },
      { value: 'whimsical', label: 'Whimsical' },
      { value: 'serious', label: 'Serious' },
      { value: 'nostalgic', label: 'Nostalgic' },
      { value: 'optimistic', label: 'Optimistic' },
      { value: 'mysterious', label: 'Mysterious' },
      { value: 'suspenseful', label: 'Suspenseful' },
      { value: 'emotional', label: 'Emotional' },
      { value: 'philosophical', label: 'Philosophical' },
      { value: 'spiritual', label: 'Spiritual' },
      
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

    const tagOptions = [
      'magic', 'adventure', 'friendship', 'mystery', 'love', 'betrayal', 'courage', 'fantasy', 'sci-fi', 'horror'
    ];
    
    // Genre options for button selection
    const genreOptions = [
      'Fantasy', 'Science Fiction', 'Mystery', 'Horror', 'Romance', 'Adventure'
    ];
  
    function handleSubmit() {
      isGenerating = true; // Set generating state to true
      
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
        keywords: enhancedKeywords + ' ' + selectedTags.join(', '),
        wordLength,
      });
      
      // In a real implementation, you would reset this when the generation completes
      // For demo purposes, we'll just set it back to false after a timeout
      setTimeout(() => {
        isGenerating = false;
      }, 2000);
    }
  
    function toggleTag(tag: string) {
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        keywords = keywords.replace(new RegExp(`\\s*${tag}(,|$)`), '$1').trim(); // Remove tag from keywords
      } else {
        selectedTags = [...selectedTags, tag]; // Use spread operator to trigger reactivity
        keywords += keywords ? `, ${tag}` : tag; // Automatically add the selected tag to keywords with a comma
      }
    }
    
    function selectGenre(selectedGenre: string) {
      genre = selectedGenre;
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="genre" class="block text-gray-300 text-sm mb-2">
        Genre
      </label>
      <div class="flex flex-wrap gap-2">
        {#each genreOptions as genreOption}
          <button 
            type="button" 
            on:click={() => selectGenre(genreOption)}
            class={`px-3 py-2 rounded-md ${genre === genreOption ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} cursor-pointer`}
          >
            {genreOption}
          </button>
        {/each}
      </div>
    </div>
    
    <div>
      <label for="keywords" class="block text-gray-300 text-sm mb-2">
        📝 Select Keywords / Just a brief prompt, no worries about grammar or punctuation! 😊
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

    <div>
      <h1 title="Select Tags" aria-controls="tag-list" class="block text-gray-300 text-sm mb-2">
        Select Tags
      </h1>
      <div id="tag-list" class="flex flex-wrap gap-2">
        {#each tagOptions as tag}
          <button 
            type="button" 
            on:click={() => toggleTag(tag)}
            class={`px-3 py-1.5 rounded-md ${selectedTags.includes(tag) ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} cursor-pointer transition-all duration-200`}
          >
            {tag}
          </button>
        {/each}
      </div>
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
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm cursor-pointer"
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
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm cursor-pointer"
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
          class="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm cursor-pointer"
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
        min="1000" 
        max="20000" 
        step="1000"
      >
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>1000</span>
        <span>20000</span>
      </div>
      <div class="flex items-center mt-2">
        <Info class="h-4 w-4 mr-1" />
        <p class="text-gray-400 text-xs mt-2">
          Disclaimer: if you generating long context, it will take longer to generate. For example, 5000 words take 2 minutes.
        </p>
      </div>
    </div>
    
    <button 
      type="submit" 
      class={`w-full font-bold py-3 px-4 rounded-md shadow-lg transition-all duration-200 flex items-center justify-center
              ${isGenerating 
                ? 'bg-gray-600 cursor-progress' 
                : 'bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-gray-900 hover:shadow-xl cursor-pointer'}`}
      disabled={isGenerating}
    >
      <WandSparkles class="mr-2 h-5 w-5" />
      {isGenerating ? 'Generating Story...' : 'Generate Story'}
    </button>
  </form>