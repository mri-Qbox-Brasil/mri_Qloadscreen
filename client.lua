CreateThread(function()
    Wait(2000)
    while true do
        Wait(1000)
        local playerId = PlayerId()
        if playerId and playerId > 0 then
            if NetworkIsPlayerActive(playerId) then
                SendNUIMessage({
                    eventName = 'closeLoadingScreen'
                })
                break
            end
        end
    end
end)
