import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 使用相对路径，部署到 GitHub Pages 的子目录或 Vercel 都能正常加载资源
  base: './',
  test: {
    environment: 'node',
  },
})
