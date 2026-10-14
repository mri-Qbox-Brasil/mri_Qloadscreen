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

-- The NUI is https and CEF only lets fetch reach https or localhost: local server first, then the Cfx.re proxy.
RegisterNUICallback('uploadStart', function(data, cb)
    local ok, result = lib.callback.await('mri_Qloadscreen:uploadStart', false, data)
    if not ok then return cb({ ok = false, error = result }) end

    local resource = GetCurrentResourceName()
    local urls = {}
    local port = (GetCurrentServerEndpoint() or ''):match(':(%d+)$')
    if port then urls[#urls + 1] = ('http://127.0.0.1:%s/%s'):format(port, resource) end
    local webBase = (result.webBase or ''):gsub('^https?://', ''):gsub('/+$', '')
    if webBase ~= '' then urls[#urls + 1] = ('https://%s/%s'):format(webBase, resource) end

    cb({ ok = true, token = result.token, name = result.name, partBytes = result.partBytes, urls = urls })
end)

RegisterNUICallback('saveConfig', function(data, cb)
    local ok, result, restart = lib.callback.await('mri_Qloadscreen:saveConfig', false, data)
    cb({ ok = ok, config = ok and result or nil, error = not ok and result or nil, restarted = restart == true })

    -- New uploads join the players' download only after a restart, done by mri_Qadmin with the admin's own permission.
    if restart and GetResourceState('mri_Qadmin') == 'started' then
        SetTimeout(300, function()
            lib.callback.await('mri_Qadmin:callback:ChangeResourceState', false, { name = GetCurrentResourceName(), state = 'restart' })
        end)
    end
end)
