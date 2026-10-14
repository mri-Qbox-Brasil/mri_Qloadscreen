-- Panel (embedded in mri_Qadmin): reads and saves data/config.json through the server.
RegisterNUICallback('getConfig', function(_, cb)
    cb(lib.callback.await('mri_Qloadscreen:getConfig', false) or false)
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
    local ok, result = lib.callback.await('mri_Qloadscreen:saveConfig', false, data)
    cb({ ok = ok, config = ok and result or nil, error = not ok and result or nil })
end)
