Config = {}

Config.UseOverlayEffect = false -- Use overlay effect on the loading screen.
Config.DiscordUrl = 'https://discord.gg/j52S7kEAcZ' -- Discord URL.

-- Video Configuration
Config.videourl = true      -- If true, plays video from an external link (Config.Backgrounds.file must be a link)
Config.videofolder = true  -- If true, plays video from config/video/ folder

-- Music Configuration
Config.musicurl = true      -- If true, plays music from an external link (Config.Backgrounds.audioLink must be a link)
Config.musicfolder = true   -- If true, plays music from config/audio/ folder (you must create this folder and configure the audio file)

Config.Backgrounds = {
    {
        file = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/GTA6.mp4',
        useVideoAudio = true, -- Toca o som do próprio vídeo
        musicName = 'GTA6',
        musicAuthor = 'Rockstar Games',
        audioLink = '',
    },
    {
        file = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/bemvindoa.mp4',
        useVideoAudio = true, -- Toca o som do próprio vídeo
        musicName = 'MriQbox',
        musicAuthor = 'mriqbox',
        audioLink = '',
    },
    {
        file = 'video.mp4',
        useVideoAudio = false, -- Usa o link de áudio abaixo (FE!N)
        musicName = 'FE!N',
        musicAuthor = 'Travis Scott',
        audioLink = 'https://r2.fivemanage.com/ilww0vsQbrOTUyk9NfMQN/2.mp3',
    }
}

Config.Texts = {
    header_1 = 'BEM-VINDO A MRI QBOX',
    header_2 = 'Comunidade onde é levado a sério e suas ideias tentamos transformar em realidades!',
    discord = 'Discord',
    online = 'Online',
    pleasewait = 'AGUARDE',
    gameloading = 'CARREGANDO A CIDADE...'
}

Config.ThemeConfig = {
    primaryColor = '#5CE65C',
    DiscordButton = {
        backgroundColor = '#5CE65C',
        textColor = '#ffffff',
    },
    Logo = {
        file = 'logo.png', -- Filename of the logo inside config/logo/
        width = 300, -- Logo width in pixels
        height = -1, -- Logo height in pixels (-1 for auto)
    }
}
