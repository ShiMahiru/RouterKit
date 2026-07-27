import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { siteConfig } from './src/config';

export default defineConfig({
	plugins: [
		react(),
		{
			name: 'html-inject',
			transformIndexHtml(html) {
				return html
					.replace('__DESCRIPTION__', siteConfig.description)
					.replace('__ICON__', siteConfig.icon);
			}
		}
	],
	resolve: {
		alias: {
			'@': path.resolve('./src')
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
