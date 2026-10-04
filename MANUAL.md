# mri_Qloadscreen: Manual

Tela de carregamento da MRI Qbox. Mostra um vídeo de fundo com música, a logo, os textos da
cidade, o botão do Discord, a staff e a barra de progresso com a etapa do carregamento do
jogo. Tudo é editado dentro do jogo, no painel do mri_Qadmin, com prévia ao vivo.

---

## Sumário

1. [Dependências](#dependências)
2. [Instalação](#instalação)
3. [Permissões (ACE)](#permissões-ace)
4. [Painel admin](#painel-admin)
5. [Arquivos locais](#arquivos-locais)
6. [Formato do `data/config.json`](#formato-do-dataconfigjson)
7. [Teclas](#teclas)
8. [Barra de progresso](#barra-de-progresso)
9. [Tema e cores](#tema-e-cores)
10. [Atualizando de uma versão com `config.lua`](#atualizando-de-uma-versão-com-configlua)
11. [Estrutura de arquivos](#estrutura-de-arquivos)
12. [Desenvolvimento](#desenvolvimento)

---

## Dependências

| Recurso | Obrigatório | Observação |
|---|---|---|
| `ox_lib` | Sim | Callbacks do painel e log do servidor |
| `mri_Qadmin` | Não | Hospeda o painel. Sem ele, a tela usa o que já está salvo |

## Instalação

1. Copie a pasta `mri_Qloadscreen` para `resources/`.
2. No `server.cfg`, garanta `ensure ox_lib` antes do resource e então `ensure mri_Qloadscreen`.
3. Desative qualquer outro resource que declare `loadscreen`: o FiveM usa só uma tela de carregamento.

O `fxmanifest.lua` usa `loadscreen_manual_shutdown 'yes'`: a tela fecha quando o jogo chama
`ShutdownLoadingScreenNui` (o qbx_core ou o mri_Qmultichar fazem isso).

## Permissões (ACE)

Pode abrir e salvar o painel quem tiver **qualquer uma** destas:

| ACE | Uso |
|---|---|
| `mri_Qloadscreen.admin` | Permissão específica do painel |
| `command` | Admin geral (god) |

## Painel admin

No mri_Qadmin, abra **Tela de carregamento**. À esquerda ficam os campos; à direita, a prévia
da tela com o rascunho atual (sem som). **Salvar** grava em `data/config.json`, **Descartar**
volta ao que está salvo e **Padrão** carrega a configuração de fábrica (só grava ao salvar).

As mudanças valem a partir da **próxima conexão**: quem já está na tela não recebe a alteração.

| Seção | Campos |
|---|---|
| Textos e Discord | Título (aceita quebra de linha), subtítulo, texto de carregamento, nome do botão e convite do Discord. Convite vazio esconde o botão |
| Visual | Logo (arquivo ou link, vazio esconde) e largura, volume inicial, escurecer o vídeo, mostrar atalhos |
| Vídeos e músicas | Lista de faixas tocadas em sequência, com ordem ajustável. Cada faixa tem vídeo, a opção de usar o som do vídeo ou uma música separada, nome e artista |
| Staff | Liga o card da staff ao lado do Discord, que troca de pessoa a cada 5 s. Lista vazia mostra os membros da org mri-Qbox-Brasil no GitHub |

## Arquivos locais

Vídeo, música, logo e foto aceitam um link (`https://...`) ou o nome de um arquivo na pasta
correspondente do resource:

| Tipo | Pasta | Formatos |
|---|---|---|
| Logo | `config/logo/` | png, jpg, webp |
| Vídeo | `config/video/` | mp4, webm |
| Música | `config/audio/` | mp3, ogg |
| Foto da staff | `config/staffs/` | png, jpg, jpeg |

Vídeo local pesado aumenta o download de quem entra pela primeira vez. Para vídeos grandes,
prefira um link.

## Formato do `data/config.json`

Criado pelo servidor na primeira subida e reescrito a cada save do painel. Campo que falta
ou vem inválido volta ao padrão.

| Campo | Tipo | Descrição |
|---|---|---|
| `texts.title` | string | Título grande |
| `texts.subtitle` | string | Texto abaixo do título |
| `texts.loading` | string | Texto acima da barra |
| `texts.discord` | string | Nome do botão do Discord |
| `discordUrl` | string | Convite do Discord. Vazio esconde o botão |
| `logo.file` | string | Arquivo em `config/logo/` ou link |
| `logo.width` | number | Largura em px (40 a 600) |
| `overlay` | bool | Gradiente escuro atrás dos textos |
| `showHints` | bool | Atalhos de teclado na tela |
| `volume` | number | Volume inicial (0 a 1) |
| `staff.enabled` | bool | Mostra o card da staff |
| `staff.members[]` | `{ image, name }` | Até 50. Vazio = membros da org no GitHub |
| `tracks[]` | `{ video, useVideoAudio, audio, title, artist }` | Até 20 faixas |

## Teclas

| Tecla | Ação |
|---|---|
| `O` | Esconde ou mostra a interface (fica o vídeo e a barra) |
| `P` | Pausa ou toca |
| `↑` `↓` | Volume |
| `←` `→` | Faixa anterior ou próxima |

## Barra de progresso

A porcentagem vem do `loadProgress` do FiveM e só anda pra frente. Ao lado do texto de
carregamento aparece a etapa atual: iniciando o jogo, preparando o mapa, carregando o mapa,
carregando o mundo e entrando na sessão.

## Tema e cores

A tela segue o tema da suíte (`@mriqbox/ui-kit`), lido no momento da conexão e enviado à NUI
pelo `deferrals.handover`:

* **Cor de destaque:** convar `mri:color`.
* **Cor de fundo:** convar `mri:backgroundColor` (vazio = `#09090B`).
* **Tema, opacidade, fonte, radius e overrides de cor:** `/uiconfig` do ox_lib, lido de
  `ox_lib/mri/data/config.json`.

## Atualizando de uma versão com `config.lua`

Se o resource sobe sem `data/config.json` e existe um `config/config.lua` antigo, o servidor
importa os textos, a logo, o Discord, a staff e as faixas dele uma única vez e grava o json.
O console mostra `config/config.lua imported into data/config.json`. Depois disso o
`config.lua` não é mais lido e pode ser apagado.

O `data/config.json` não vem no repositório: atualizar o resource não apaga a configuração.

## Estrutura de arquivos

```
mri_Qloadscreen/
├── fxmanifest.lua
├── server.lua          # config em data/config.json, handover, save do painel, plugin do Qadmin
├── client.lua          # callbacks NUI do painel
├── data/config.json    # gerado pelo servidor (fora do git)
├── config/             # logo, video, audio, staffs
├── html/               # build da interface (tela e painel)
└── web/                # código da interface (React + Vite)
    └── src/
        ├── App.jsx                 # entrada da tela: progresso e etapa
        ├── loadscreen/             # a tela, usada também na prévia do painel
        ├── admin/                  # painel do mri_Qadmin
        └── lib/                    # tema, assets, staff, bridge do plugin
```

## Desenvolvimento

```bash
cd web
pnpm install
pnpm dev     # tela em /, painel em /admin.html, com dados de exemplo
pnpm lint
pnpm build   # saída em ../html
```

No navegador, a tela simula o progresso e o painel salva só em memória. A NUI do FiveM é
Chrome 103: o build mira `chrome103`.
