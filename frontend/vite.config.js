import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		extensions: ['.js', '.jsx', '.json']
	},
	build: {
		// Django の静的ファイルディレクトリに出力
		outDir: '../backend/frontend/static/frontend',
		// ビルド時に outDir をクリアしない（Django の他のファイルを保護）
		emptyOutDir: true,
		rollupOptions: {
			input: 'src/index.jsx',
			output: {
				entryFileNames: 'main.js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]'
			}
		}
	},
	server: {
		// 開発サーバーのポート設定
		port: 3000,
		// Django サーバーとの連携のため
		cors: true
	}
})
