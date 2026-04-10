import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs';
import path from 'path';

// Vite plugin to read config.lua and parse the basic table structure
const luaConfigPlugin = () => ({
  name: 'lua-config',
  configureServer(server) {
    server.middlewares.use('/api/config', (req, res) => {
      try {
        const luaPath = path.resolve(__dirname, '../config/config.lua');
        let luaContent = fs.readFileSync(luaPath, 'utf8');

        // Remove comentários do Lua (`--`) para evitar parse de blocos desativados
        luaContent = luaContent.split('\n').map(line => {
          const commentIdx = line.indexOf('--');
          return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
        }).join('\n');

        // Um parser de regex burro mas funcional para essa estrutura de lua específica em dev
        // O cliente.lua fará isso no ambiente de produção
        const config = {
          UseOverlayEffect: false,
          videourl: false,
          videofolder: true,
          musicurl: false,
          musicfolder: false,
          DiscordUrl: '',
          Backgrounds: [{ file: '', musicName: '', musicAuthor: '', audioLink: '' }],
          Texts: { header_1: '', header_2: '', discord: '', online: '', pleasewait: '', gameloading: '' },
          ThemeConfig: { primaryColor: '', DiscordButton: { backgroundColor: '', textColor: '' } }
        };

        // Extrai ThemeConfig
        const themeMatch = luaContent.match(/Config\.ThemeConfig\s*=\s*{([\s\S]*?)}/);
        if (themeMatch) {
          const primaryMatch = themeMatch[1].match(/primaryColor\s*=\s*'([^']+)'/);
          if (primaryMatch) config.ThemeConfig.primaryColor = primaryMatch[1];
          
          const bgMatch = themeMatch[1].match(/backgroundColor\s*=\s*'([^']+)'/);
          if (bgMatch) config.ThemeConfig.DiscordButton.backgroundColor = bgMatch[1];

          // Logo match
          config.ThemeConfig.Logo = { file: 'logo.png', width: 300, height: -1 };
          const logoThemeMatch = luaContent.match(/Logo\s*=\s*{([\s\S]*?)}/);
          if (logoThemeMatch) {
             const fileMatch = logoThemeMatch[1].match(/file\s*=\s*'([^']+)'/);
             if (fileMatch) config.ThemeConfig.Logo.file = fileMatch[1];
             
             const widthMatch = logoThemeMatch[1].match(/width\s*=\s*(-?\d+)/);
             if (widthMatch) config.ThemeConfig.Logo.width = parseInt(widthMatch[1]);
             
             const heightMatch = logoThemeMatch[1].match(/height\s*=\s*(-?\d+)/);
             if (heightMatch) config.ThemeConfig.Logo.height = parseInt(heightMatch[1]);
          }
        }

        // Extrai Textos
        const textMatch = luaContent.match(/Config\.Texts\s*=\s*{([\s\S]*?)}/);
        if (textMatch) {
          const h1Match = textMatch[1].match(/header_1\s*=\s*'([^']+)'/);
          if (h1Match) config.Texts.header_1 = h1Match[1];
          
          const h2Match = textMatch[1].match(/header_2\s*=\s*'([^']+)'/);
          if (h2Match) config.Texts.header_2 = h2Match[1];

          const discordTextMatch = textMatch[1].match(/discord\s*=\s*'([^']+)'/);
          if (discordTextMatch) config.Texts.discord = discordTextMatch[1];

          const onlineMatch = textMatch[1].match(/online\s*=\s*'([^']+)'/);
          if (onlineMatch) config.Texts.online = onlineMatch[1];

          const waitMatch = textMatch[1].match(/pleasewait\s*=\s*'([^']+)'/);
          if (waitMatch) config.Texts.pleasewait = waitMatch[1];

          const loadingMatch = textMatch[1].match(/gameloading\s*=\s*'([^']+)'/);
          if (loadingMatch) config.Texts.gameloading = loadingMatch[1];
        }

        // Extrai URL do Discord
        const discordMatch = luaContent.match(/Config\.DiscordUrl\s*=\s*'([^']+)'/);
        if (discordMatch) config.DiscordUrl = discordMatch[1];

        // Extrai OverlayEffect
        const overlayMatch = luaContent.match(/Config\.UseOverlayEffect\s*=\s*(true|false)/);
        if (overlayMatch) config.UseOverlayEffect = overlayMatch[1] === 'true';

        // Extrai Booleans de Midia
        const videoUrlMatch = luaContent.match(/Config\.videourl\s*=\s*(true|false)/);
        if (videoUrlMatch) config.videourl = videoUrlMatch[1] === 'true';

        const videoFolderMatch = luaContent.match(/Config\.videofolder\s*=\s*(true|false)/);
        if (videoFolderMatch) config.videofolder = videoFolderMatch[1] === 'true';

        const musicUrlMatch = luaContent.match(/Config\.musicurl\s*=\s*(true|false)/);
        if (musicUrlMatch) config.musicurl = musicUrlMatch[1] === 'true';

        const musicFolderMatch = luaContent.match(/Config\.musicfolder\s*=\s*(true|false)/);
        if (musicFolderMatch) config.musicfolder = musicFolderMatch[1] === 'true';

        // Extrai Backgrounds info complementar
        const bgArrayMatch = luaContent.match(/Config\.Backgrounds\s*=\s*{([\s\S]*?)}\s*(\n\n|$)/);
        if (bgArrayMatch) {
          const bgContent = bgArrayMatch[1];
          const blocks = [...bgContent.matchAll(/{([^}]*)}/g)];
          config.Backgrounds = [];
          
          blocks.forEach(blockMatch => {
            const block = blockMatch[1];
            const bgItem = { file: '', musicName: '', musicAuthor: '', audioLink: '' };
            
            const fileMatch = block.match(/file\s*=\s*'([^']+)'/);
            if (fileMatch) bgItem.file = fileMatch[1];
            
            const audioLinkMatch = block.match(/audioLink\s*=\s*'([^']+)'/);
            if (audioLinkMatch) bgItem.audioLink = audioLinkMatch[1];

            const musicNameMatch = block.match(/musicName\s*=\s*'([^']+)'/);
            if (musicNameMatch) bgItem.musicName = musicNameMatch[1];

            const musicAuthorMatch = block.match(/musicAuthor\s*=\s*'([^']+)'/);
            if (musicAuthorMatch) bgItem.musicAuthor = musicAuthorMatch[1];
            
            config.Backgrounds.push(bgItem);
          });
          
          if (config.Backgrounds.length === 0) {
             config.Backgrounds = [{ file: '', musicName: '', musicAuthor: '', audioLink: '' }];
          }
        }

        // Set response headers and send JSON
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(config));
      } catch (e) {
        console.error('Error parsing config.lua', e);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.toString() }));
      }
    });

    // Rota local para servir a logo em dev (produção o FiveM resolve pelo fxmanifest)
    server.middlewares.use('/config/logo', (req, res, next) => {
      const filePath = path.join(__dirname, '../config/logo', req.url.split('?')[0]);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        let mime = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.svg') mime = 'image/svg+xml';
        else if (ext === '.webp') mime = 'image/webp';
        
        res.setHeader('Content-Type', mime);
        res.end(fs.readFileSync(filePath));
      } else {
        next();
      }
    });

    server.middlewares.use('/config/audio', (req, res, next) => {
      const filePath = path.join(__dirname, '../config/audio', req.url.split('?')[0]);
      if (fs.existsSync(filePath)) {
        res.end(fs.readFileSync(filePath));
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    luaConfigPlugin()
  ],
  base: './',
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: '../html',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/script.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/styles.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
})
