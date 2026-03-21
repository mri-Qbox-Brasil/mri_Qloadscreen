CreateThread(function()
    -- Espera inicial curta para garantir que o NUI está pronto
    Wait(2000)
    
    while true do
        Wait(1000)
        local playerId = PlayerId()
        
        -- Verifica se o ID do jogador é válido (maior que 0) e se ele está ativo no mundo
        if playerId and playerId > 0 then
            if NetworkIsPlayerActive(playerId) then
                -- O jogador está no mundo, envia sinal para fechar o loading screen
                SendNUIMessage({
                    eventName = 'closeLoadingScreen'
                })
                break
            end
        end
    end
end)
