import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',       // 업데이트 시 사용자에게 확인 요청
      injectRegister: 'auto',
      strategies: 'injectManifest', // 커스텀 SW와 통합하기 위해 injectManifest 사용
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: false,              // manifest.json은 별도 관리
      devOptions: { enabled: true }
    })
  ],
})
