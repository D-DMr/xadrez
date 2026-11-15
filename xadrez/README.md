# Xadrez Total

## Aplicação Windows

O instalador contém o jogo e pode ser criado num computador Windows:

```sh
npm ci
npm run build:win
```

O executável é criado em `dist/Xadrez-Total-Setup.exe`. Para publicar uma nova versão para download, envia uma tag `v*` (por exemplo, `v1.0.0`). O workflow em `.github/workflows/release-windows.yml` cria uma GitHub Release e anexa o instalador. A aba **Descarregar** do site aponta para o instalador da última release.

O tabuleiro e as partidas contra o computador funcionam offline. O início de sessão Google só está disponível na versão web.
