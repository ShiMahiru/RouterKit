import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { postImagesPlugin } from './vite-plugins/post-images.js';
import path from 'path';

export default defineConfig({
	plugins: [react(), postImagesPlugin()],
	resolve: {
		alias: {
			'$lib': path.resolve('./src/lib')
		}
	},
	build: {
		outDir: 'build',
		rollupOptions: {
			output: {
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			}
		}
	}
});
