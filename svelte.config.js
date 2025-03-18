import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		adapter: adapter()
	},
	alias: {
		$lib: './src/lib',
		$components: './src/components',
		$routes: './src/routes',
		$types: './src/types',
		$utils: './src/utils',
		$hooks: './src/hooks',
		$stores: './src/stores',
		$styles: './src/styles',
		$env: './src/env',
	},

	extensions: ['.svelte', '.svx']
};

export default config;
