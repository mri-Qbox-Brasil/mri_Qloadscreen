-- Panel (embedded in mri_Qadmin): reads and saves data/config.json through the server.
RegisterNUICallback('getConfig', function(_, cb)
    cb(lib.callback.await('mri_Qloadscreen:getConfig', false) or false)
end)

RegisterNUICallback('saveConfig', function(data, cb)
    local ok, result = lib.callback.await('mri_Qloadscreen:saveConfig', false, data)
    cb({ ok = ok, config = ok and result or nil, error = not ok and result or nil })
end)
