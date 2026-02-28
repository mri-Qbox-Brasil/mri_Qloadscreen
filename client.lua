-- Fetch data from the config.lua
local configPayload = {
    UseOverlayEffect = Config.UseOverlayEffect,
    DiscordUrl = Config.DiscordUrl,
    Backgrounds = Config.Backgrounds,
    Texts = Config.Texts,
    ThemeConfig = Config.ThemeConfig
}

-- Send data down to NUI UI when resource starts or is running
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(100)
        SendNUIMessage({
            eventName = 'loadConfig',
            config = configPayload
        })
        break
    end
end)
