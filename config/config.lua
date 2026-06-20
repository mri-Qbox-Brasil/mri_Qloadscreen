Config = {}

Config.UseOverlayEffect = true -- Se deve usar um efeito de overlay escuro no fundo (ajuda a ler textos)
Config.DiscordUrl = 'https://discord.gg/mriqbox' -- Discord URL.

-- Configuração da Staff
Config.ShowStaff = true -- Ativar carrossel da staff
Config.StaffList = {
    { image = 'murai.png', staff = 'MURAI' },
    { image = 'g5.jpeg', staff = 'G5' },
    { image = 'snow.png', staff = 'SNOW' },
    { image = 'gh.jpeg', staff = 'GH' },
    { image = 'gordela.png', staff = 'GORDELA' },
    { image = 'jj.png', staff = 'JJ' },
    { image = 'xstells.png', staff = 'XSTELLS' },
    { image = 'subzero.png', staff = 'SUBZERO' },
}

-- Video Configuration
Config.videourl = true      -- If true, plays video from an external link (Config.Backgrounds.file must be a link)
Config.videofolder = true  -- If true, plays video from config/video/ folder

-- Music Configuration
Config.musicurl = true      -- If true, plays music from an external link (Config.Backgrounds.audioLink must be a link)
Config.musicfolder = true   -- If true, plays music from config/audio/ folder (you must create this folder and configure the audio file)

Config.Backgrounds = {

    ---MODELO VIA URL---
    {
        file = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/GTA6.mp4',
        useVideoAudio = true, -- Toca o som do próprio vídeo
        musicName = 'GTA6',
        musicAuthor = 'Rockstar Games',
        audioLink = '',
    },
    ---MODELO VIA URL---
    {
        file = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/bemvindoa.mp4',
        useVideoAudio = true, -- Toca o som do próprio vídeo
        musicName = 'MriQbox',
        musicAuthor = 'mriqbox',
        audioLink = '',
    },
    ---MODELO VIA PASTA---
    -- {
    --     file = 'video.mp4',
    --     useVideoAudio = false, -- Usa o link de áudio abaixo (FE!N)
    --     musicName = 'FE!N',
    --     musicAuthor = 'Travis Scott',
    --     audioLink = 'https://r2.fivemanage.com/ilww0vsQbrOTUyk9NfMQN/2.mp3',
    -- }
}

Config.Texts = {
    header_1 = 'BEM-VINDO A MRI',
    header_2 = 'Comunidade BR onde o RP é levado a sério e transformamos suas ideias em realidade!',
    discord = 'Discord',
    online = 'Online',
    pleasewait = 'AGUARDE',
    gameloading = 'CARREGANDO A CIDADE...'
}

Config.ThemeConfig = {
    Logo = {
        file = 'logo.png', -- Filename of the logo inside config/logo/
        width = 300, -- Logo width in pixels
        height = -1, -- Logo height in pixels (-1 for auto)
    }
}

-- Cor de destaque vinda da convar global `mri:color` (compartilhada com
-- toda a suite MRI: mri_Qmultichar, mri_Qspawn, mri_Qadmin). Defina via
-- `setr mri:color "#hex"` no server.cfg ou pelo painel admin do mri_Qadmin.
Config.AccentColor = GetConvar('mri:color', '#00E699')
