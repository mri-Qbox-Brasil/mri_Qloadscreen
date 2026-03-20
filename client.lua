CreateThread(function()
    while true do
        Wait(500)
        -- Verifica se o jogador já está ativo e o mundo carregado
        if NetworkIsPlayerActive(PlayerId()) then
            -- Envia a mensagem para o NUI fechar a tela
            SendNUIMessage({
                eventName = 'closeLoadingScreen'
            })
            break -- Sai do loop após enviar o sinal
        end
    end
end)
