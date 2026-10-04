local CONFIG_FILE = 'data/config.json'
local LEGACY_FILE = 'config/config.lua'
local MAX_TRACKS = 20
local MAX_STAFF = 50

local defaults = {
    texts = {
        title = 'BEM-VINDO A MRI',
        subtitle = 'Comunidade BR onde o RP é levado a sério e transformamos suas ideias em realidade!',
        loading = 'Carregando a cidade',
        discord = 'Discord',
    },
    logo = { file = 'logo.png', width = 220 },
    discordUrl = 'https://discord.gg/mriqbox',
    overlay = true,
    showHints = true,
    volume = 0.5,
    -- Empty members = the mri-Qbox-Brasil org members from GitHub.
    staff = { enabled = true, members = {} },
    tracks = {
        {
            video = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/GTA6.mp4',
            useVideoAudio = true,
            audio = '',
            title = 'GTA6',
            artist = 'Rockstar Games',
        },
        {
            video = 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/bemvindoa.mp4',
            useVideoAudio = true,
            audio = '',
            title = 'MriQbox',
            artist = 'mriqbox',
        },
    },
}

local current

local function str(value, fallback, max)
    if type(value) ~= 'string' then return fallback end
    return value:sub(1, max or 300)
end

local function num(value, fallback, min, max)
    value = tonumber(value)
    if not value then return fallback end
    return math.max(min, math.min(max, value))
end

local function bool(value, fallback)
    if type(value) ~= 'boolean' then return fallback end
    return value
end

---Fills every missing or invalid field from the defaults; the result is always the full shape.
local function normalize(input)
    input = type(input) == 'table' and input or {}
    local texts = type(input.texts) == 'table' and input.texts or {}
    local logo = type(input.logo) == 'table' and input.logo or {}
    local staff = type(input.staff) == 'table' and input.staff or {}

    local out = {
        texts = {
            title = str(texts.title, defaults.texts.title, 120),
            subtitle = str(texts.subtitle, defaults.texts.subtitle, 400),
            loading = str(texts.loading, defaults.texts.loading, 80),
            discord = str(texts.discord, defaults.texts.discord, 40),
        },
        logo = {
            file = str(logo.file, defaults.logo.file),
            width = math.floor(num(logo.width, defaults.logo.width, 40, 600)),
        },
        discordUrl = str(input.discordUrl, defaults.discordUrl),
        overlay = bool(input.overlay, defaults.overlay),
        showHints = bool(input.showHints, defaults.showHints),
        volume = num(input.volume, defaults.volume, 0, 1),
        staff = { enabled = bool(staff.enabled, defaults.staff.enabled), members = {} },
        tracks = {},
    }

    if type(staff.members) == 'table' then
        for _, member in ipairs(staff.members) do
            if #out.staff.members >= MAX_STAFF then break end
            if type(member) == 'table' then
                out.staff.members[#out.staff.members + 1] = {
                    image = str(member.image, ''),
                    name = str(member.name, '', 80),
                }
            end
        end
    end

    local tracks = type(input.tracks) == 'table' and input.tracks or defaults.tracks
    for _, track in ipairs(tracks) do
        if #out.tracks >= MAX_TRACKS then break end
        if type(track) == 'table' then
            out.tracks[#out.tracks + 1] = {
                video = str(track.video, ''),
                useVideoAudio = bool(track.useVideoAudio, false),
                audio = str(track.audio, ''),
                title = str(track.title, '', 80),
                artist = str(track.artist, '', 80),
            }
        end
    end

    return out
end

---One-time import of the old config/config.lua (before the panel existed).
local function importLegacy()
    local raw = LoadResourceFile(cache.resource, LEGACY_FILE)
    if not raw then return end

    local env = { GetConvar = GetConvar }
    local chunk = load(raw, '@' .. LEGACY_FILE, 't', env)
    if not chunk or not pcall(chunk) or type(env.Config) ~= 'table' then
        lib.print.warn(('%s could not be read, using the defaults'):format(LEGACY_FILE))
        return
    end

    local old = env.Config
    local texts = old.Texts or {}
    local logo = old.ThemeConfig and old.ThemeConfig.Logo or {}
    local imported = {
        texts = { title = texts.header_1, subtitle = texts.header_2, loading = texts.gameloading, discord = texts.discord },
        logo = { file = logo.file, width = logo.width },
        discordUrl = old.DiscordUrl,
        overlay = old.UseOverlayEffect,
        staff = { enabled = old.ShowStaff, members = {} },
    }

    for _, member in ipairs(old.StaffList or {}) do
        imported.staff.members[#imported.staff.members + 1] = { image = member.image, name = member.staff }
    end

    if type(old.Backgrounds) == 'table' then
        imported.tracks = {}
        for _, bg in ipairs(old.Backgrounds) do
            imported.tracks[#imported.tracks + 1] = {
                video = bg.file,
                useVideoAudio = bg.useVideoAudio,
                audio = bg.audioLink,
                title = bg.musicName,
                artist = bg.musicAuthor,
            }
        end
    end

    return imported
end

local function save(config)
    return SaveResourceFile(cache.resource, CONFIG_FILE, json.encode(config, { indent = true }), -1)
end

local function loadConfig()
    local raw = LoadResourceFile(cache.resource, CONFIG_FILE)
    if raw and raw ~= '' then
        local ok, decoded = pcall(json.decode, raw)
        if ok then
            current = normalize(decoded)
            return
        end
        lib.print.warn(('%s is invalid, using the defaults'):format(CONFIG_FILE))
        current = normalize(nil)
        return
    end

    local legacy = importLegacy()
    current = normalize(legacy)
    if legacy and save(current) then
        lib.print.info(('%s imported into %s'):format(LEGACY_FILE, CONFIG_FILE))
    end
end

loadConfig()

local function getUiConfig()
    if GetResourceState('ox_lib') == 'missing' then return nil end
    local raw = LoadResourceFile('ox_lib', 'mri/data/config.json')
    if not raw or raw == '' then return nil end
    local ok, cfg = pcall(json.decode, raw)
    return ok and type(cfg) == 'table' and cfg or nil
end

local function isAdmin(source)
    return IsPlayerAceAllowed(source, 'mri_Qloadscreen.admin') or IsPlayerAceAllowed(source, 'command')
end

AddEventHandler('playerConnecting', function(_, _, deferrals)
    deferrals.defer()
    Wait(0)

    deferrals.handover({
        config = current,
        accentColor = GetConvar('mri:color', '#00E699'),
        backgroundColor = GetConvar('mri:backgroundColor', ''),
        uiConfig = getUiConfig(),
    })

    deferrals.done()
end)

lib.callback.register('mri_Qloadscreen:getConfig', function(source)
    if not isAdmin(source) then return false end
    return { config = current, defaults = normalize(nil) }
end)

lib.callback.register('mri_Qloadscreen:saveConfig', function(source, payload)
    if not isAdmin(source) then return false, 'sem permissão' end
    if type(payload) ~= 'table' then return false, 'dados inválidos' end

    local config = normalize(payload)
    if not save(config) then return false, 'falha ao salvar' end

    current = config
    return true, current
end)

-- Panel as a mri_Qadmin plugin; RegisterPlugin is idempotent by id, so all three paths are safe.
local function registerPlugin()
    if GetResourceState('mri_Qadmin') ~= 'started' then return end

    exports['mri_Qadmin']:RegisterPlugin({
        id = 'loadscreen',
        label = 'Tela de carregamento',
        icon = 'monitor-play',
        resource = cache.resource,
        htmlPath = 'html/admin.html',
        requiredPerms = { 'mri_Qloadscreen.admin', 'command' },
        description = 'Textos, logo, vídeos, músicas e staff da tela de carregamento',
    })
end

AddEventHandler('mri_Qadmin:server:pluginsReady', registerPlugin)

AddEventHandler('onServerResourceStart', function(resourceName)
    if resourceName == 'mri_Qadmin' then registerPlugin() end
end)

CreateThread(registerPlugin)
