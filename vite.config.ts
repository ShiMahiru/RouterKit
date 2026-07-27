import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { siteConfig } from './src/config';
import { markdownPrecompilePlugin } from './plugins/vite-plugin-markdown-precompile';

export default defineConfig({
	plugins: [
		react(),
		markdownPrecompilePlugin(),
		{
			name: 'html-inject',
			transformIndexHtml(html) {
				return html
					.replaceAll('__TITLE__', siteConfig.title)
					.replaceAll('__DESCRIPTION__', siteConfig.description)
					.replaceAll('__URL__', siteConfig.url)
					.replaceAll('__ICON__', siteConfig.icon);
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