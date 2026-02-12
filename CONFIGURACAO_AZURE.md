# Configuração para Envio Automático via Microsoft Graph API

## Passo 1: Registrar App no Azure AD

1. Acesse: https://portal.azure.com
2. Vá em **Azure Active Directory** > **App registrations** > **New registration**
3. Preencha:
   - **Name**: Doc Permite App
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Tipo: Single-page application (SPA)
     - URL: `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

4. Clique em **Register**

## Passo 2: Configurar Permissões

1. No app criado, vá em **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph** > **Delegated permissions**
4. Adicione: **Mail.Send**
5. Clique em **Add permissions**

## Passo 3: Copiar Client ID

1. Vá em **Overview**
2. Copie o **Application (client) ID**
3. Cole no arquivo `auth.js` na linha:
   ```javascript
   clientId: 'SEU_CLIENT_ID_AQUI'
   ```

## Passo 4: Atualizar Redirect URI

No arquivo `auth.js`, atualize:
```javascript
redirectUri: 'https://SEU-USUARIO.github.io/SEU-REPOSITORIO/'
```

## Passo 5: Subir para GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload dos arquivos:
   - index.html
   - styles.css
   - script.js
   - auth.js
3. Vá em **Settings** > **Pages**
4. Ative GitHub Pages na branch main

## Como Funciona

1. Usuário preenche o formulário
2. Clica em "Enviar Documentos"
3. Popup de login do Microsoft aparece (primeira vez)
4. Após login, e-mail é enviado automaticamente com anexos
5. E-mail vai para: doc.permite@per.com.br
6. Assunto: "Novo - Credenciamento"

## Observações

- Login é necessário apenas na primeira vez
- Token fica salvo na sessão do navegador
- Anexos são enviados automaticamente
- E-mail formatado em HTML para fácil extração pelo Power Automate
