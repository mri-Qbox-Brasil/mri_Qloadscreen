local CONFIG_FILE = 'data/config.json'
local LEGACY_FILE = 'config/config.lua'
local MAX_TRACKS = 20
local MAX_STAFF = 50

local defaults = {
    texts = {
        title = 'MRI QBOX',
        subtitle = 'Menos configuração.\nMais criação.',
        loading = 'CARREGANDO...',
        discord = 'Entre agora!',
    },
    logo = { file = 'logo.png', width = 70 },
    discordUrl = 'https://discord.mriqbox.com.br',
    overlay = true,
    showHints = true,
    volume = 0.1,
    -- Empty members = the mri-Qbox-Brasil org members from GitHub.
    staff = { enabled = true, members = {} },
    tracks = {
        {
            video = 'video.mp4',
            useVideoAudio = true,
            audio = '',
            title = 'GTA6',
            artist = 'Rockstar Games',
        },
    },
}

local current

-- Hides GTA's busy spinner drawn over the loadscreen (bottom right).
SetConvarReplicated('sv_showBusySpinnerOnLoadingScreen', 'false')

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

-- Uploaded files only reach players after a restart (the client downloads the file list from resource start).
local pendingRestart = false

local function restartSelf()
    pendingRestart = false
    SetTimeout(500, function()
        ExecuteCommand('refresh')
        ExecuteCommand('ensure ' .. cache.resource)
    end)
end

lib.callback.register('mri_Qloadscreen:saveConfig', function(source, payload)
    if not isAdmin(source) then return false, 'sem permissão' end
    if type(payload) ~= 'table' then return false, 'dados inválidos' end

    local config = normalize(payload)
    if not save(config) then return false, 'falha ao salvar' end

    current = config
    if pendingRestart then restartSelf() end
    return true, current
end)

--------------------------------------------------------------------------------
-- Upload from the panel: parts of PART_BYTES over the server's own HTTP port.
--------------------------------------------------------------------------------

-- FXServer drops an HTTP request whose body is over 5 MiB, so files go in 4 MiB parts.
local PART_BYTES <const> = 4 * 1024 * 1024
local MAX_UPLOAD_BYTES <const> = 100 * 1024 * 1024
local SLOT_TTL <const> = 60

local UPLOAD_KINDS <const> = {
    video = { folder = 'config/video', exts = { mp4 = true, webm = true } },
    audio = { folder = 'config/audio', exts = { mp3 = true, ogg = true, wav = true } },
}

local slots = {}

local function newToken()
    return ('%08x%08x%08x%08x'):format(
        math.random(0, 0xFFFFFFFF), math.random(0, 0xFFFFFFFF),
        math.random(0, 0xFFFFFFFF), math.random(0, 0xFFFFFFFF))
end

local function fileExists(path)
    local file = io.open(GetResourcePath(cache.resource) .. '/' .. path, 'rb')
    if file then file:close() end
    return file ~= nil
end

---Safe file name inside the kind's folder; never overwrites an existing file.
local function uniqueName(kind, original)
    local base, ext = tostring(original):match('^(.-)%.(%w+)$')
    ext = ext and ext:lower()
    if not ext or not kind.exts[ext] then return nil end

    base = base:lower():gsub('[^%w_%-]+', '_'):gsub('^[_%-]+', ''):sub(1, 60)
    if base == '' then base = 'arquivo' end

    local name, n = ('%s.%s'):format(base, ext), 1
    while fileExists(('%s/%s'):format(kind.folder, name)) do
        n = n + 1
        name = ('%s-%d.%s'):format(base, n, ext)
    end
    return name
end

lib.callback.register('mri_Qloadscreen:uploadStart', function(source, data)
    if not isAdmin(source) then return false, 'sem permissão' end
    if type(data) ~= 'table' then return false, 'dados inválidos' end

    local kind = UPLOAD_KINDS[data.kind]
    if not kind then return false, 'tipo inválido' end

    local size = math.tointeger(tonumber(data.size))
    if not size or size <= 0 then return false, 'arquivo vazio' end
    if size > MAX_UPLOAD_BYTES then return false, ('maior que %d MB'):format(MAX_UPLOAD_BYTES // 1048576) end

    local name = uniqueName(kind, data.name)
    if not name then return false, 'formato não aceito' end

    for token, slot in pairs(slots) do
        if slot.src == source then slots[token] = nil end
    end

    local token = newToken()
    slots[token] = { src = source, path = ('%s/%s'):format(kind.folder, name), name = name, size = size, parts = {}, received = 0, expires = os.time() + SLOT_TTL }
    return true, { token = token, name = name, partBytes = PART_BYTES, webBase = GetConvar('web_baseUrl', '') }
end)

AddEventHandler('playerDropped', function()
    local src = source
    for token, slot in pairs(slots) do
        if slot.src == src then slots[token] = nil end
    end
end)

-- The Cfx.re proxy (*.users.cfx.re) already sends Access-Control-Allow-Origin; a second one makes the browser block it.
local function viaProxy(req)
    for name, value in pairs(req.headers or {}) do
        local key = tostring(name):lower()
        if key == 'host' and tostring(value):find('users%.cfx%.re') then return true end
        if key == 'x-forwarded-for' or key == 'x-cfx-source-ip' then return true end
    end
    return false
end

local function reply(req, res, status, body)
    local headers = { ['Content-Type'] = 'application/json' }
    if not viaProxy(req) then
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Content-Type'
    end
    res.writeHead(status, headers)
    res.send(json.encode(body))
end

SetHttpHandler(function(req, res)
    if req.method == 'OPTIONS' then return reply(req, res, 204, {}) end
    if req.method == 'GET' and req.path == '/ping' then return reply(req, res, 200, { ok = true }) end
    if req.method ~= 'POST' then return reply(req, res, 404, { ok = false }) end

    local token, part, total = tostring(req.path):match('^/upload/(%x+)/(%d+)/(%d+)$')
    local slot = token and slots[token]
    if not slot then return reply(req, res, 403, { ok = false, error = 'envio expirado' }) end

    part, total = math.tointeger(tonumber(part)), math.tointeger(tonumber(total))
    if not part or not total or part ~= #slot.parts + 1 or part > total or slot.busy or os.time() > slot.expires then
        slots[token] = nil
        return reply(req, res, 403, { ok = false, error = 'envio fora de ordem' })
    end

    slot.busy = true
    req.setDataHandler(function(body)
        slot.busy = false
        if slots[token] ~= slot then return reply(req, res, 403, { ok = false, error = 'envio expirado' }) end
        if type(body) ~= 'string' or #body > PART_BYTES or slot.received + #body > slot.size then
            slots[token] = nil
            return reply(req, res, 413, { ok = false, error = 'arquivo maior que o informado' })
        end

        slot.parts[part] = body
        slot.received = slot.received + #body
        slot.expires = os.time() + SLOT_TTL
        if part < total then return reply(req, res, 200, { ok = true }) end

        slots[token] = nil
        if slot.received ~= slot.size then return reply(req, res, 400, { ok = false, error = 'arquivo incompleto' }) end

        local data = table.concat(slot.parts)
        -- Length must be explicit: -1 stops at the first zero byte and saves an empty video.
        if not SaveResourceFile(cache.resource, slot.path, data, #data) then
            return reply(req, res, 500, { ok = false, error = 'falha ao gravar' })
        end

        pendingRestart = true
        lib.print.info(('%s enviou %s (%.1f MB)'):format(GetPlayerName(slot.src) or slot.src, slot.path, #data / 1048576))
        reply(req, res, 200, { ok = true, name = slot.name })
    end, 'binary')
end)

CreateThread(function()
    while true do
        Wait(30000)
        local now = os.time()
        for token, slot in pairs(slots) do
            if now > slot.expires then slots[token] = nil end
        end
    end
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
