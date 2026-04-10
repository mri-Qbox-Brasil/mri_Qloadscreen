# 🎮 MRI QLoadscreen

Uma tela de carregamento (Loading Screen) moderna e dinâmica para o seu servidor FiveM, construída com React, Vite e Tailwind CSS.

## ✨ Características
*   **Design Moderno:** Interface de usuário limpa e responsiva.
*   **Configuração Fácil:** Todas as configurações visuais e de texto são feitas diretamente no arquivo `config/config.lua`.
*   **Integração Nativa:** Utiliza o sistema `nuiHandoverData` do FiveM para injetar as configurações instantaneamente, sem atrasos ou problemas de rede (CORS).
*   **Mídias Flexíveis:** Suporte a vídeos e músicas misturando URLs da internet e arquivos locais na mesma lista.
*   **Áudio do Vídeo:** Opção de usar o som original do vídeo em vez de uma música separada.
*   **Progresso em Tempo Real:** Barra de progresso modernizada com marcador de tempo atual e bloqueio de avanço para vídeos.
*   **Botão do Discord:** Link clicável para o Discord da sua comunidade.

## ⚙️ Como Configurar

1. Acesse a pasta `config`.
2. Abra o arquivo `config.lua`.
3. Edite as variáveis conforme a sua preferência:
    *   `Config.ThemeConfig`: Defina as cores primárias (`primaryColor`), fundo do botão Discord e logo.
    *   `Config.Backgrounds`: Lista de fundos. Cada item pode ter:
        *   `file`: Nome do arquivo na pasta `config/video/` ou Link (URL).
        *   `useVideoAudio`: `true` para usar o som do próprio vídeo, `false` para usar música separada.
        *   `audioLink`: Nome do arquivo na pasta `config/audio/` ou Link (URL).
        *   `musicName` e `musicAuthor`: Nome e artista exibidos na UI.
    *   `Config.DiscordUrl`: Coloque o link de convite do seu Discord.

**Atenção:** Mídias locais (arquivos físicos de vídeo e áudio) devem ser colocadas nas respectivas pastas:
*   Imagens de logo: `config/logo/`
*   Vídeos mp4/webm/ogg: `config/video/`
*   Músicas mp3: `config/audio/`

Qualquer alteração no `config.lua` refletirá automaticamente no servidor assim que o script for reiniciado.