# Xadrez Total

## Aplicação Windows portátil

O executável portátil contém o jogo e pode ser criado num computador Windows:

```sh
npm ci
npm run build:win
```

O executável é criado em `dist/Xadrez-Total.exe`. É um `.exe` portátil: não tem assistente de instalação; a primeira execução extrai os componentes necessários para uma pasta temporária. Para publicar uma nova versão para download, envia uma tag `v*`. O workflow em `.github/workflows/release-windows.yml` cria uma GitHub Release e anexa o executável. A aba **Descarregar** do site aponta para o ficheiro da última release.

O tabuleiro, puzzles, regras, aberturas, táticas, definições e partidas contra o computador funcionam offline. O início de sessão Google usa o navegador predefinido e um fluxo OAuth de aplicação instalada com PKCE; precisa de internet. Para o ativar, `googleDesktopClientId` em `desktop/main.cjs` tem de ser um OAuth Client ID do tipo **Desktop app** criado no projeto Firebase/Google Cloud da aplicação; não uses um client ID Web nem um client secret. A aplicação impede que duas janelas independentes sejam abertas pelo mesmo utilizador; os processos auxiliares do Chromium/Electron fazem parte normal da aplicação.

A janela usa o ícone do Xadrez Total e uma barra identificada com controlos para minimizar, maximizar/restaurar, ecrã inteiro e fechar. `F11` ativa ou termina o ecrã inteiro; `Esc` sai dele.

## Assinatura digital

Sem certificado de assinatura de código, o Windows pode mostrar o aviso do Microsoft Defender SmartScreen. Não é possível remover ou contornar esse aviso com uma alteração ao código. Para assinar as próximas versões, obtém um certificado de assinatura de código Windows em formato PKCS#12 (`.p12`) e adiciona aos GitHub Actions secrets do repositório:

- `WINDOWS_CERTIFICATE_BASE64`: conteúdo do certificado `.p12` codificado em Base64.
- `WINDOWS_CERTIFICATE_PASSWORD`: palavra-passe do certificado.

O workflow usa-os apenas durante a compilação. A assinatura identifica o editor; o Windows ainda pode mostrar avisos enquanto o ficheiro não tiver reputação suficiente.
