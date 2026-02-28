local configData = Config or {}

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    deferrals.defer()

    Wait(0)

    -- Injeta as configurações diretamente no loading screen usando o nativo window.nuiHandoverData do FiveM
    deferrals.handover({
        config = configData
    })

    deferrals.done()
end)
