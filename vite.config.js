import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      // 这是一个通用的代理“坑位”
      '/proxy': {
        target: 'https://api.siliconflow.cn', // 随便填个默认的，不影响你在 index.vue 填 https
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '')
      }
    }
  }
})