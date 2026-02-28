# 🎮 MRI QLoadscreen

Uma tela de carregamento (Loading Screen) moderna e dinâmica para o seu servidor FiveM, construída com React, Vite e Tailwind CSS.

## ✨ Características
*   **Design Moderno:** Interface de usuário limpa e responsiva.
*   **Configuração Fácil:** Todas as configurações visuais e de texto são feitas diretamente no arquivo `config/config.lua`.
*   **Integração Nativa:** Utiliza o sistema `nuiHandoverData` do FiveM para injetar as configurações instantaneamente, sem atrasos ou problemas de rede (CORS).
*   **Mídias e Temas:** Suporte a vídeos de fundo (locais ou URLs diretas), músicas (com controles de volume e progresso) e múltiplas imagens de fundo rotativas.
*   **Botão do Discord:** Link clicável para o Discord da sua comunidade.

## ⚙️ Como Configurar

1. Acesse a pasta `config`.
2. Abra o arquivo `config.lua`.
3. Edite as variáveis conforme a sua preferência:
    *   `Config.ThemeConfig`: Defina as cores primárias, fundo do botão Discord e logo.
    *   `Config.Texts`: Altere os textos de boas-vindas, status, etc.
    *   `Config.Backgrounds`: Adicione seus vídeos, músicas (URLs ou arquivos locais dentro das pastas correspondentes) ou imagens.
    *   `Config.DiscordUrl`: Coloque o link de convite do seu Discord.

**Atenção:** Mídias locais (arquivos físicos de vídeo e áudio) devem ser colocadas nas respectivas pastas:
*   Imagens de logo: `config/logo/`
*   Vídeos mp4/webm/ogg: `config/video/`
*   Músicas mp3: `config/audio/`

Qualquer alteração no `config.lua` refletirá automaticamente no servidor assim que o script for reiniciado.