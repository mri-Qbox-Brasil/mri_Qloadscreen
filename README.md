# mri_Qloadscreen

Tela de carregamento da MRI Qbox: vídeo de fundo, música, logo, textos, botão do Discord, staff e a barra de progresso com a etapa do carregamento do jogo. Tudo é editado dentro do jogo, pelo painel do mri_Qadmin.

## Requisitos

*   `ox_lib`
*   `mri_Qadmin`, para editar pelo painel (sem ele a tela funciona com o que já está salvo)

## Como editar

No mri_Qadmin, abra **Tela de carregamento**. O painel mostra uma prévia ao vivo e salva em `data/config.json`. As mudanças valem a partir da próxima conexão ao servidor.

Quem pode editar: quem tiver a ACE `mri_Qloadscreen.admin` ou `command`.

| Seção | O que ajusta |
|---|---|
| Textos e Discord | Título, subtítulo, texto de carregamento, nome do botão e convite do Discord (vazio esconde o botão) |
| Visual | Logo e largura, volume inicial, escurecimento do vídeo, atalhos de teclado na tela |
| Vídeos e músicas | Faixas em sequência. Cada uma tem um vídeo e usa o som dele ou uma música separada |
| Staff | Liga ou desliga o card da staff. Lista vazia mostra os membros da org MRI no GitHub |

### Arquivos locais

Vídeo, música, logo e fotos aceitam um link (`https://...`) ou o nome de um arquivo nas pastas do resource:

*   Logo: `config/logo/`
*   Vídeos: `config/video/`
*   Músicas: `config/audio/`
*   Fotos da staff: `config/staffs/`

## Atualizando de uma versão com `config/config.lua`

Na primeira vez que o resource sobe sem `data/config.json`, o servidor importa o `config/config.lua` antigo uma única vez. Depois disso, o `config.lua` não é mais lido e pode ser apagado.

O `data/config.json` não vem no repositório, então atualizar o resource não apaga a configuração da cidade.

## Teclas na tela

| Tecla | Ação |
|---|---|
| `O` | Esconde ou mostra a interface (fica só o vídeo e a barra) |
| `P` | Pausa ou toca |
| `↑` `↓` | Volume |
| `←` `→` | Faixa anterior ou próxima |

## Tema da suíte MRI

A tela segue o tema da suíte (`@mriqbox/ui-kit`), lido no momento da conexão e enviado à NUI pelo `deferrals.handover` do `server.lua`:

*   **Cor de destaque:** convar `mri:color`.
*   **Cor de fundo:** convar `mri:backgroundColor` (vazio = padrão `#09090B`).
*   **Tema, opacidade, fonte, radius e overrides de cor:** `/uiconfig` do ox_lib, lido de `ox_lib/mri/data/config.json`.

## Desenvolvimento

A interface fica em `web/` (React + Vite) e o build sai em `html/`:

```bash
cd web
pnpm install
pnpm dev     # http://localhost:5173/ (tela) e /admin.html (painel), com dados de exemplo
pnpm build
```

A tela fecha quando o jogo chama `ShutdownLoadingScreenNui` (o qbx_core ou o mri_Qmultichar fazem isso).
