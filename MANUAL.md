# mri_Qloadscreen — Manual

Tela de carregamento com plano de fundo em vídeo ou imagem, galeria de screenshots, player de música e links de redes sociais, toda configurada em um único arquivo JavaScript.

---

## Sumário

1. [Dependências](#dependências)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Plano de fundo](#plano-de-fundo)
5. [Galeria de imagens](#galeria-de-imagens)
6. [Player de música](#player-de-música)
7. [Redes sociais](#redes-sociais)
8. [Textos](#textos)
9. [Personalização visual (SCSS)](#personalização-visual-scss)
10. [Estrutura de arquivos](#estrutura-de-arquivos)

---

## Dependências

O recurso não tem código Lua e não depende de framework, `ox_lib` ou banco de dados. É apenas um `loadscreen` declarado no `fxmanifest.lua`.

| Recurso | Obrigatório | Observação |
|---|---|---|
| — | — | Nenhum recurso do servidor é necessário |
| YouTube (externo) | Não | Só se `background.type` for `"video"`. O embed é carregado da internet pelo cliente |
| Vibrant.js (CDN) | Não | Carregado pelo `index.html` para extrair a cor dominante da capa da música |

---

## Instalação

1. Copie a pasta `mri_Qloadscreen` para `resources/`.
2. Adicione ao `server.cfg`:
   ```
   ensure mri_Qloadscreen
   ```
3. Remova ou desabilite qualquer outro recurso que declare `loadscreen` — o FiveM usa apenas uma tela de carregamento.
4. Não há SQL a importar.

O `fxmanifest.lua` já define o comportamento da tela:

| Diretiva | Valor | Efeito |
|---|---|---|
| `loadscreen` | `public/index.html` | Página renderizada durante o carregamento |
| `loadscreen_cursor` | `yes` | Mostra o cursor do mouse (necessário para a galeria e o player) |
| `loadscreen_manual_shutdown` | `no` | A tela fecha sozinha quando o jogo termina de carregar |

---

## Configuração

Todas as opções ficam em `public/script/config.js`.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `autoSlideInterval` | number (ms) | Sim | Intervalo da troca automática de slides da galeria |
| `autoPlay` | bool | Sim | Toca a música automaticamente ao abrir a tela. Também controla o autoplay do vídeo de fundo local |
| `musicVolume` | number (0–1) | Sim | Volume inicial do player (`0.05` = 5%) |
| `background.type` | `"video"` \| `"videoPasta"` \| qualquer outro | Sim | Tipo do plano de fundo. Veja [Plano de fundo](#plano-de-fundo) |
| `background.url` | string | Sim | ID do vídeo do YouTube, caminho de um vídeo local ou caminho de uma imagem, conforme o `type` |
| `background.videoProvider` | string | Não | Presente no config apenas como anotação; o código sempre usa o embed do YouTube quando `type = "video"` |
| `socialMedia` | array | Sim | Até 4 itens, cada um com `name`, `icon` e `link` |
| `images` | array de strings | Sim | Caminhos das imagens da galeria |
| `songs` | array | Sim | Playlist. Cada item tem `title`, `artist`, `src` e `img` |
| `locales` | objeto | Sim | Textos da tela. Veja [Textos](#textos) |

---

## Plano de fundo

O valor de `background.type` decide como o fundo é montado:

| `type` | `url` esperado | Comportamento |
|---|---|---|
| `"video"` | ID do vídeo do YouTube (ex.: `QdBZY2fkU-0`) | Cria um iframe do YouTube em autoplay, mudo, em loop e sem controles |
| `"videoPasta"` | Caminho de um arquivo local (ex.: `/public/videos/intro.mp4`) | Cria um `<video>` mudo, em loop, com `object-fit: cover`. O autoplay segue `autoPlay` |
| qualquer outro valor | Caminho de uma imagem (ex.: `/public/images/background.png`) | Define a imagem como `background-image`, com `cover` e centralizada |

O fundo em YouTube exige que o cliente tenha acesso à internet. Para servidores que não querem essa dependência, use `"videoPasta"` ou uma imagem.

---

## Galeria de imagens

Os caminhos em `images` viram slides. A galeria troca sozinha a cada `autoSlideInterval` ms e tem setas de navegação e indicadores clicáveis. Clicar em uma imagem abre o modo tela cheia, com navegação entre as imagens e botão de fechar.

Para trocar as imagens, coloque os arquivos em `public/images/` e aponte os caminhos no array:

```js
images: [
  "/public/images/images_1.png",
  "/public/images/images_2.png",
],
```

---

## Player de música

Player completo no rodapé: play/pause, faixa anterior/próxima, barra de progresso arrastável, tempo decorrido/total e controle de volume.

```js
songs: [
  {
    title: "Love Is a Long Road",
    artist: "Tom Petty",
    src: "/public/music/TomPetty.mp3",
    img: "/public/images/love.jpg",
  },
],
```

A capa (`img`) é usada também para tingir o player: a cor dominante da imagem é extraída com Vibrant.js. Os arquivos de áudio devem ficar em `public/music/`. O volume inicial vem de `musicVolume`; a barra de volume da UI trabalha em escala de 0 a 100.

---

## Redes sociais

Máximo de 4 itens. Cada ícone é um SVG em `public/images/`.

```js
socialMedia: [
  { name: "Discord", icon: "/public/images/discord.svg", link: "https://discord.gg/..." },
  { name: "YouTube", icon: "/public/images/youtube.svg", link: "https://youtube.com/..." },
],
```

Clicar em um ícone **não abre o link** — a tela de carregamento não tem navegador. O link é copiado para a área de transferência e uma mensagem de confirmação aparece na tela, para o jogador colar no navegador depois.

---

## Textos

Ficam no objeto `locales` do `config.js`.

| Campo | Tipo | Descrição |
|---|---|---|
| `headerTitle` | string | Título do cabeçalho. Na versão atual o valor não é aplicado pelo script — o título vem fixo do `public/index.html` (`id="headerTitle"`). Para mudá-lo, edite o HTML |
| `headerSubtitles` | array de strings | Uma delas é sorteada a cada carregamento |
| `cardTitles` | array de strings | Sorteado junto com a descrição (mesmo índice) |
| `cardDescriptions` | array de strings | Deve ter a mesma quantidade de itens de `cardTitles` — o script usa o mesmo índice sorteado nos dois |
| `serverGalleryTitle` | string | Título da seção da galeria |
| `serverGalleryDescription` | string | Descrição da seção da galeria |
| `socialMediaText` | string | Texto que precede o link |
| `socialMediaLinkText` | string | Texto do link |
| `socialMediaLinkURL` | string | URL do link |

Não há sistema de idiomas: os textos são escritos direto no config, no idioma do servidor.

---

## Personalização visual (SCSS)

O CSS de `public/css/main.css` é gerado a partir dos arquivos em `scss/`. Edite o SCSS, não o CSS compilado.

```
pnpm install
pnpm run scss      # compila uma vez
pnpm run dev       # recompila ao salvar (watch)
```

Os parciais são importados por `scss/main.scss` e cada um cobre uma área da tela: `_base`, `_header`, `_welcome`, `_gallery`, `_player`, `_socialMedia`, `_utils` e `_responsive`.

---

## Estrutura de arquivos

```
mri_Qloadscreen/
├── public/
│   ├── index.html            — markup da tela (loadscreen declarado no fxmanifest)
│   ├── script/
│   │   ├── config.js         — TODA a configuração: fundo, galeria, músicas, redes sociais, textos
│   │   └── scripts.js        — galeria, player de música, fundo, textos e cópia dos links sociais
│   ├── css/
│   │   ├── main.css          — CSS compilado a partir de scss/ (não editar à mão)
│   │   └── reset-inputs.css  — reset dos inputs (sliders de progresso e volume)
│   ├── images/               — logo, fundo, slides da galeria, capas e ícones SVG
│   └── music/                — arquivos de áudio da playlist
├── scss/
│   ├── main.scss             — importa os parciais abaixo
│   ├── _base.scss            — reset e estilos globais
│   ├── _header.scss          — cabeçalho (logo, título, subtítulo)
│   ├── _welcome.scss         — card de boas-vindas
│   ├── _gallery.scss         — galeria e modo tela cheia
│   ├── _player.scss          — player de música
│   ├── _socialMedia.scss     — barra de redes sociais
│   ├── _utils.scss           — variáveis e mixins
│   └── _responsive.scss      — breakpoints
├── package.json              — scripts scss/dev (sass)
└── fxmanifest.lua
```
