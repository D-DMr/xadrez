# Xadrez Total

## Aplicação Windows

O instalador contém o jogo e pode ser criado num computador Windows:

```sh
npm ci
npm run build:win
```

O executável é criado em `dist/Xadrez-Total-Setup.exe`. É um instalador `.exe` único; como qualquer instalador, instala os ficheiros da aplicação no computador. Para publicar uma nova versão para download, envia uma tag `v*` (por exemplo, `v1.0.1`). O workflow em `.github/workflows/release-windows.yml` cria uma GitHub Release e anexa o instalador. A aba **Descarregar** do site aponta para o instalador da última release.

O tabuleiro, puzzles, regras, aberturas, táticas, definições e partidas contra o computador funcionam offline. O início de sessão Google só está disponível na versão web. A aplicação impede que duas janelas independentes sejam abertas pelo mesmo utilizador; os processos auxiliares do Chromium/Electron fazem parte normal da aplicação.

## Assinatura do instalador

Sem certificado de assinatura de código, o Windows pode mostrar o aviso de editor desconhecido. Não é possível remover esse aviso apenas com uma alteração ao código. Para assinar os próximos instaladores, compra/obtém um certificado de assinatura de código Windows em formato PKCS#12 (`.p12`) e adiciona aos GitHub Actions secrets do repositório:

- `WINDOWS_CERTIFICATE_BASE64`: conteúdo do certificado `.p12` codificado em Base64.
- `WINDOWS_CERTIFICATE_PASSWORD`: palavra-passe do certificado.

O workflow usa-os apenas durante a compilação. A assinatura identifica o editor; o Windows ainda pode mostrar avisos enquanto o ficheiro não tiver reputação suficiente.
