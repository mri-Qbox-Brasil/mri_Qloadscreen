-- Panel (embedded in mri_Qadmin): reads and saves data/config.json through the server.
RegisterNUICallback('getConfig', function(_, cb)
    cb(lib.callback.await('mri_Qloadscreen:getConfig', false) or false)
end)

-- Fullscreen preview on the ui_page; mri_Qadmin hides meanwhile and comes back on ESC.
RegisterNUICallback('openFullscreen', function(data, cb)
    cb(true)
    local theme = lib.callback.await('mri_Qloadscreen:getTheme', false)
    if not theme then return end

    if GetResourceState('mri_Qadmin') == 'started' then exports.mri_Qadmin:ClosePlugin('loadscreen') end
    SendNUIMessage({ action = 'fullscreen', config = data, theme = theme })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('closeFullscreen', function(_, cb)
    cb(true)
    SetNuiFocus(false, false)
    if GetResourceState('mri_Qadmin') == 'started' then exports.mri_Qadmin:OpenPlugin('loadscreen') end
end)

-- The NUI is https and CEF blocks a remote http fetch: local server first, then web_baseUrl over https, then uploadPart.
RegisterNUICallback('uploadStart', function(data, cb)
    local ok, result = lib.callback.await('mri_Qloadscreen:uploadStart', false, data)
    if not ok then return cb({ ok = false, error = result }) end

    local resource = GetCurrentResourceName()
    local urls = {}
    local port = (GetCurrentServerEndpoint() or ''):match(':(%d+)$')
    if port then urls[#urls + 1] = ('http://127.0.0.1:%s/%s'):format(port, resource) end
    local webBase = (result.webBase or ''):gsub('^https?://', ''):gsub('/+$', '')
    if webBase ~= '' then urls[#urls + 1] = ('https://%s/%s'):format(webBase, resource) end

    cb({ ok = true, token = result.token, name = result.name, partBytes = result.partBytes, eventPartBytes = result.eventPartBytes, urls = urls })
end)

-- Bytes per second for the latent event, same rate screencapture uses for its video chunks.
local PART_BPS <const> = 5000000
local PART_TIMEOUT <const> = 60000
local partWaits = {}

RegisterNetEvent('mri_Qloadscreen:uploadPartResult', function(token, result)
    local p = partWaits[token]
    if not p then return end
    partWaits[token] = nil
    p:resolve(result)
end)

-- One part in flight per upload: the NUI only sends the next after the server's answer.
RegisterNUICallback('uploadPart', function(data, cb)
    local token = data.token
    if type(token) ~= 'string' then return cb({ ok = false, error = 'envio expirado' }) end

    local p = promise.new()
    partWaits[token] = p
    TriggerLatentServerEvent('mri_Qloadscreen:uploadPart', PART_BPS, token, data.part, data.total, data.data)
    SetTimeout(PART_TIMEOUT, function()
        if partWaits[token] ~= p then return end
        partWaits[token] = nil
        p:resolve({ ok = false, error = 'o servidor não respondeu' })
    end)
    cb(Citizen.Await(p))
end)

-- File changes join the players' download only after a restart, done by mri_Qadmin with the admin's own permission.
local function restartViaQadmin(delay)
    if GetResourceState('mri_Qadmin') ~= 'started' then return end
    SetTimeout(delay, function()
        lib.callback.await('mri_Qadmin:callback:ChangeResourceState', false, { name = GetCurrentResourceName(), state = 'restart' })
    end)
end

RegisterNUICallback('saveConfig', function(data, cb)
    local ok, result, restart = lib.callback.await('mri_Qloadscreen:saveConfig', false, data)
    cb({ ok = ok, config = ok and result or nil, error = not ok and result or nil, restarted = restart == true })
    if restart then restartViaQadmin(300) end
end)

RegisterNUICallback('listFiles', function(_, cb)
    cb(lib.callback.await('mri_Qloadscreen:listFiles', false) or false)
end)

-- Several deletes in a row end in a single restart, a few seconds after the last one.
local deleteRound = 0

RegisterNUICallback('deleteFile', function(data, cb)
    local ok, err = lib.callback.await('mri_Qloadscreen:deleteFile', false, data)
    cb({ ok = ok, error = err })
    if not ok then return end

    deleteRound = deleteRound + 1
    local round = deleteRound
    SetTimeout(4000, function()
        if round ~= deleteRound then return end
        if lib.callback.await('mri_Qloadscreen:applyFiles', false) then restartViaQadmin(0) end
    end)
end)
