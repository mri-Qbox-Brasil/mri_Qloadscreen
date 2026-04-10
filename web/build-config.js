import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const luaPath = path.resolve(__dirname, '../config/config.lua');
const jsonPath = path.resolve(__dirname, '../html/config.json'); // We will build it straight to the public output

try {
  let luaContent = fs.readFileSync(luaPath, 'utf8');

  // Remove comentários do Lua (`--`)
  luaContent = luaContent.split('\n').map(line => {
    const commentIdx = line.indexOf('--');
    return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
  }).join('\n');

  const config = {
    UseOverlayEffect: false,
    videourl: false,
    videofolder: true,
    musicurl: false,
    musicfolder: false,
    DiscordUrl: '',
    Backgrounds: [{ file: '', musicName: '', musicAuthor: '', audioLink: '' }],
    Texts: { header_1: '', header_2: '', discord: '', online: '', pleasewait: '', gameloading: '' },
    ThemeConfig: { primaryColor: '', DiscordButton: { backgroundColor: '', textColor: '' }, Logo: { file: 'logo.png', width: 300, height: -1 } }
  };

  const themeMatch = luaContent.match(/Config\.ThemeConfig\s*=\s*{([\s\S]*?)}/);
  if (themeMatch) {
     const primaryMatch = themeMatch[1].match(/primaryColor\s*=\s*'([^']+)'/);
     if (primaryMatch) config.ThemeConfig.primaryColor = primaryMatch[1];
     
     const bgMatch = themeMatch[1].match(/backgroundColor\s*=\s*'([^']+)'/);
     if (bgMatch) config.ThemeConfig.DiscordButton.backgroundColor = bgMatch[1];

     const tcMatch = themeMatch[1].match(/textColor\s*=\s*'([^']+)'/);
     if (tcMatch) config.ThemeConfig.DiscordButton.textColor = tcMatch[1];

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

  const discordMatch = luaContent.match(/Config\.DiscordUrl\s*=\s*'([^']+)'/);
  if (discordMatch) config.DiscordUrl = discordMatch[1];

  const overlayMatch = luaContent.match(/Config\.UseOverlayEffect\s*=\s*(true|false)/);
  if (overlayMatch) config.UseOverlayEffect = overlayMatch[1] === 'true';

  const videoUrlMatch = luaContent.match(/Config\.videourl\s*=\s*(true|false)/);
  if (videoUrlMatch) config.videourl = videoUrlMatch[1] === 'true';

  const videoFolderMatch = luaContent.match(/Config\.videofolder\s*=\s*(true|false)/);
  if (videoFolderMatch) config.videofolder = videoFolderMatch[1] === 'true';

  const musicUrlMatch = luaContent.match(/Config\.musicurl\s*=\s*(true|false)/);
  if (musicUrlMatch) config.musicurl = musicUrlMatch[1] === 'true';

  const musicFolderMatch = luaContent.match(/Config\.musicfolder\s*=\s*(true|false)/);
  if (musicFolderMatch) config.musicfolder = musicFolderMatch[1] === 'true';

  const bgArrayMatch = luaContent.match(/Config\.Backgrounds\s*=\s*{([\s\S]*?)}\s*(\n\n|$|Config)/);
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
  }
  
  if (config.Backgrounds.length === 0) {
     config.Backgrounds = [{ file: '', musicName: '', musicAuthor: '', audioLink: '' }];
  }

  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
  console.log('Successfully compiled config.lua into HTML config.json!');

} catch (e) {
  console.error('Error compiling config.lua to JSON:', e);
}
