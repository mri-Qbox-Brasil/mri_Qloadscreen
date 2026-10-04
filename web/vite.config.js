import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const CONFIG_DIR = path.resolve(__dirname, '../config')

// Dev only: serves config/ (logo, video, audio, staffs) like the game does from the resource root.
const configFolderPlugin = () => ({
  name: 'config-folder',
  configureServer(server) {
    server.middlewares.use('/config', (req, res, next) => {
      const filePath = path.join(CONFIG_DIR, decodeURIComponent(req.url.split('?')[0]))
      if (!filePath.startsWith(CONFIG_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return next()
      fs.createReadStream(filePath).pipe(res)
    })
  },
})

export default defineConfig({
  plugins: [react(), configFolderPlugin()],
  base: './',
  build: {
    outDir: '../html',
    emptyOutDir: true,
    // The loadscreen and the Qadmin panel run on FiveM's CEF (Chrome 103).
    target: 'chrome103',
    cssTarget: 'chrome103',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
