import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	

	kit: {
		adapter: adapter({
			precompress: true,
			strict: true,
			env: {
				PORT: process.env.PORT || 3000
			}
		})
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
