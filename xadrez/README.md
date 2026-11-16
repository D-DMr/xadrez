# Xadrez Total

## Aplicação Windows portátil

O executável portátil contém o jogo e pode ser criado num computador Windows:

```sh
npm ci
# Cria desktop/oauth-client.json com o ID e o secret do cliente OAuth Desktop.
npm run build:win
```

O executável é criado em `dist/Xadrez-Total.exe`. É um `.exe` portátil: não tem assistente de instalação; a primeira execução extrai os componentes necessários para uma pasta temporária. Para publicar uma nova versão para download, envia uma tag `v*`. O workflow em `.github/workflows/release-windows.yml` cria uma GitHub Release e anexa o executável. A aba **Descarregar** do site aponta para o ficheiro da última release.

O tabuleiro, puzzles, regras, aberturas, táticas, definições e partidas contra o computador funcionam offline. As partidas online usam o Firestore para emparelhar jogadores autenticados com Google e sincronizar os lances; as regras em `firestore.rules` limitam cada sala aos dois participantes e validam a ordem dos lances. O início de sessão Google usa o navegador predefinido e um fluxo OAuth de aplicação instalada com PKCE; precisa de internet. Para compilar localmente, cria `desktop/oauth-client.json` (ignorado pelo Git) com o ID e o secret do cliente OAuth do tipo **Desktop app** indicado em `desktop/main.cjs`. Para publicar uma versão com início de sessão, configura o secret do cliente como `GOOGLE_DESKTOP_CLIENT_SECRET` nos GitHub Actions secrets do repositório. O workflow inclui-o na configuração do build. Os clientes Desktop são aplicações públicas: o secret incluído no `.exe` não é confidencial nem deve ser tratado como mecanismo de segurança. A aplicação impede que duas janelas independentes sejam abertas pelo mesmo utilizador; os processos auxiliares do Chromium/Electron fazem parte normal da aplicação.

A janela usa o ícone do Xadrez Total e uma barra identificada com controlos para minimizar, maximizar/restaurar, ecrã inteiro e fechar. `F11` ativa ou termina o ecrã inteiro; `Esc` sai dele.

## Assinatura digital

Sem certificado de assinatura de código, o Windows pode mostrar o aviso do Microsoft Defender SmartScreen. Não é possível remover ou contornar esse aviso com uma alteração ao código. Para assinar as próximas versões, obtém um certificado de assinatura de código Windows em formato PKCS#12 (`.p12`) e adiciona aos GitHub Actions secrets do repositório:

- `WINDOWS_CERTIFICATE_BASE64`: conteúdo do certificado `.p12` codificado em Base64.
- `WINDOWS_CERTIFICATE_PASSWORD`: palavra-passe do certificado.

O workflow usa-os apenas durante a compilação. A assinatura identifica o editor; o Windows ainda pode mostrar avisos enquanto o ficheiro não tiver reputação suficiente.
