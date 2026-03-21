local configData = Config or {}

AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    deferrals.defer()

    -- Pequena espera para estabilidade
    Wait(500)

    -- Injeta as configurações diretamente no loading screen
    deferrals.handover({
        config = Config or configData
    })

    Wait(500)
    deferrals.done()
end)
