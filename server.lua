local configData = Config or {}

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    deferrals.defer()
    Wait(500)

    deferrals.handover({
        config = Config or configData,
        accentColor = GetConvar('mri:color', (Config and Config.AccentColor) or '#00E699'),
    })

    Wait(500)
    deferrals.done()
end)
