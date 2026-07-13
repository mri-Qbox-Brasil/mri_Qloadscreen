# MANUAL - mri_Qloadscreen

## O que o recurso faz
Tela de carregamento moderna e otimizada para servidores FiveM, substituindo a tela padrão por uma interface visual personalizada com cursor customizado durante o processo de carregamento do jogo.

## Funcionalidades principais
- Design moderno e visualmente atraente para tela de loading
- Cursor customizado habilitado por padrão durante o carregamento
- Carregamento rápido e otimizado para baixo impacto em performance
- Fácil customização via arquivos HTML, CSS e SCSS
- Baseado no design original do Beta Studio

## Como funciona (fluxo de trabalho)
1. O FiveM carrega o resource antes de outros recursos conforme ordem no `server.cfg`
2. O arquivo `public/index.html` definido no `fxmanifest.lua` é renderizado como tela de carregamento
3. O cursor customizado é ativado automaticamente conforme configuração `loadscreen_cursor`
4. Arquivos SCSS de estilização são compilados para CSS para renderização da interface

## Opções de configuração disponíveis
Configurações definidas no `fxmanifest.lua`:
| Opção | Valor padrão | Descrição |
|-------|--------------|-----------|
| `loadscreen` | `public/index.html` | Caminho do arquivo HTML da tela de loading |
| `loadscreen_cursor` | `yes` | Habilita cursor customizado durante o carregamento |
| `loadscreen_manual_shutdown` | `no` | Permite que o jogador feche a tela de loading manualmente |

## Comandos disponíveis
Nenhum comando de jogo disponível (resource exclusivo de interface NUI)

## Eventos que dispara/ouve
Nenhum evento de jogo (resource de interface estática sem lógica de jogo)

## Exports que fornece/consome
Nenhum export fornecido ou consumido (resource independente de lógica de jogo)

## Integração com outros recursos MRI Qbox
Nenhuma integração direta (resource autônomo de interface)

## Casos de uso / exemplos práticos
- Personalizar a tela de carregamento do servidor com a logo da comunidade
- Alterar cores e estilos da tela editando os arquivos SCSS na pasta `scss/`
- Compilar alterações de estilo: Executar `npm install` seguido de `npm run build` para gerar o CSS final

## Dicas de solução de problemas
- Tela de loading não aparece: Confirme que `ensure mri_Qloadscreen` está posicionado antes de outros recursos no `server.cfg`
- Alterações de estilo não aplicam: Execute `npm run build` para compilar os arquivos SCSS após edição
- Cursor customizado não aparece: Verifique se `loadscreen_cursor` está definido como `yes` no fxmanifest
- Erro ao compilar SCSS: Instale as dependências com `npm install` antes de executar o build