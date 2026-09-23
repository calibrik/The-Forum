import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 5173,
	},
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
	},
	build: {
		assetsInlineLimit: 0,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router/') || id.includes('/scheduler/')) {
							return 'react';
						}

						if (id.includes('/gsap/') || id.includes('/@gsap/react/')) {
							return 'gsap';
						}

						if (id.includes('/dexie/')) {
							return 'db';
						}
					}
				},
			},
		},
	},
})