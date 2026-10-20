# Página de links da Ferren · versão 2

Evolução da versão 1 (`../ferren-links`, que continua intacta, com cópia em `../backups/ferren-links-v1-2026-10-20`). As duas pastas são independentes: cada uma tem os próprios arquivos, imagens e servidor de teste.

## O que há de novo

- **Mundo em camadas:** céu da catedral com relâmpagos, a foto de vocês voando ao fundo (aparece no caminho até a comunidade), a marca Q-CORE gigante que desliza com a rolagem, galhos de espinhos nos cantos, cinza, brasas, chuva e névoa. Tudo responde ao mouse, à rolagem e, em celulares Android, à inclinação do aparelho.
- **Entrada:** o portão espera as imagens principais carregarem (linha de progresso), abre e a câmera atravessa.
- **Cartão:** cantos de prata, luz contínua correndo pelas bordas do cartão e de cada painel, corrente pendurada que balança e o medalhão de coração com a foto de vocês (abre ao toque). A assinatura "Ferren" se escreve com uma ponta de caneta brilhando e um floreio por baixo. A borda de espinhos volta depois da descrição.
- **Capítulos:** "Explore" e "Community" em letra gótica, com a linha de espinhos que se desenha; tudo entra e sai suavemente conforme a rolagem.
- **Painéis:** luz que segue o mouse, seta magnética, inclinação, ondinha ao tocar. O jogo tem a capa em paralaxe e brilho; as roupas giram como um carrossel e **passam sozinhas** devagar (as artes do portfólio também, no sentido contrário). Passar o mouse, tocar ou arrastar pausa; depois de uns segundos elas voltam a andar.
- **Nossas fotos:** medalhão (perfil), retrato "Memories" com cortina, voando (fundo) e, no final, a foto escura do coração com a assinatura de Ferren sendo escrita, uma pequena aliança e "I love my man · @imghostrxzz · ImGhostDev". Os apelidos foram removidos da foto das asas. Tratamento em `tools/prepare_us.py`.

## Música

A versão 2 está **sem música**. O SoundCloud só toca 30 segundos dessa faixa, e o YouTube não permite tocar a música inteira escondida numa barrinha.

Se um dia houver uma cópia autorizada de "So proud" (Cece Natalie), basta colocar o arquivo em `audio/so-proud.mp3`. A barrinha de baixo aparece sozinha e toca a faixa inteira, em loop, a partir do toque no portão.

## Foto de perfil automática

O site lê `data/avatar.json`. Quem atualiza esse arquivo é o GitHub Actions ([.github/workflows/discord-avatar.yml](.github/workflows/discord-avatar.yml)): a cada 30 minutos ele pergunta à API oficial do Discord qual é a foto atual da Ferren, pelo **ID da conta** (`1098242796919476264`, que nunca muda), e não pelo nome de usuário. Quando a foto muda, ele grava o arquivo e pede ao GitHub Pages para publicar. A mudança aparece no site em até uns 30 a 40 minutos.

- **O que precisa ao publicar:** um segredo no repositório, chamado `DISCORD_BOT_TOKEN`, com o token do bot Ferren. O token nunca vai para o navegador.
- **Teste local:** `DISCORD_BOT_TOKEN=... node scripts/update-avatar.mjs`.
- **Se falhar:** se o arquivo não carregar, o site mostra a foto que vem junto (`img/avatar.webp`).

## Onde editar

| O quê | Onde |
|---|---|
| Textos e links | [index.html](index.html) |
| Convite do Discord | o link em [index.html](index.html) e `DISCORD_INVITE` em [js/main.js](js/main.js) |
| Volume e música | `VOLUME` e `SONG` em [js/main.js](js/main.js) |
| Roupas e artes das faixas | `LOOKS` e `ART` em [js/main.js](js/main.js) |
| Cores e fontes | topo de [css/style.css](css/style.css) |

## Imagens

```bash
python tools/prepare.py tools/src ../qcore-gallery/img ../m0rrign-portfolio/art/thumb
python tools/prepare_us.py tools/src/us
```

A pasta `tools/` (com os originais das nossas fotos) fica só no PC.
