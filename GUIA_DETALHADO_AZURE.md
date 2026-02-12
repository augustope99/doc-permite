# 🎯 GUIA SUPER DETALHADO - AZURE ENTRA ID (antigo Azure AD)

## ✅ PERFEITO! Você está no lugar certo!

**Microsoft Entra ID** é o novo nome do **Azure Active Directory**. É exatamente o que você precisa!

---

## 📍 PASSO 1: Entrar no Microsoft Entra ID

1. Você já está vendo **"Microsoft Entra ID"** ou **"Windows Azure Active Directory"**
2. **CLIQUE** nele

Você verá uma tela parecida com isso:

```
┌────────────────────────────────────────────────────────┐
│  Microsoft Entra ID                                    │
│  (ou Windows Azure Active Directory)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🏠 Overview (Visão geral)                            │
│  👥 Users (Usuários)                                  │
│  👥 Groups (Grupos)                                   │
│  🔐 Enterprise applications (Aplicativos empresariais)│
│  📱 App registrations (Registros de aplicativo) ← AQUI│
│  🔑 Identity Governance                               │
│  🛡️ Security                                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📍 PASSO 2: Clicar em "App registrations"

1. No menu lateral **ESQUERDO**, procure por:
   - **"App registrations"** (em inglês) OU
   - **"Registros de aplicativo"** (em português)
2. **CLIQUE** nele

---

## 📍 PASSO 3: Criar Novo Registro

Você verá uma tela assim:

```
┌────────────────────────────────────────────────────────┐
│  App registrations | Registros de aplicativo           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [+ New registration] [+ Novo registro]  ← CLIQUE AQUI│
│                                                        │
│  🔍 Search...                                         │
│                                                        │
│  📋 Lista de aplicativos (pode estar vazia)           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

1. Clique no botão **"+ New registration"** ou **"+ Novo registro"**

---

## 📍 PASSO 4: Preencher o Formulário

Você verá um formulário. Preencha assim:

```
┌────────────────────────────────────────────────────────┐
│  Register an application                               │
│  Registrar um aplicativo                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Name * (Nome)                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │ Doc Permite App                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Supported account types * (Tipos de conta)           │
│  ○ Accounts in this organizational directory only     │
│     (PER INTERMEDIACAO DE PAGAMENTOS only)            │
│     - Single tenant                          ← MARQUE │
│                                                        │
│  ○ Accounts in any organizational directory           │
│     (Any Azure AD directory - Multitenant)            │
│                                                        │
│  ○ Accounts in any organizational directory and       │
│     personal Microsoft accounts                       │
│                                                        │
│  Redirect URI (optional) (URI de redirecionamento)    │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │ Single-page app │  │ http://localhost         │  │
│  │ (SPA)      ▼    │  │                          │  │
│  └─────────────────┘  └──────────────────────────┘  │
│                                                        │
│  [Register] [Registrar]                    ← CLIQUE   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**IMPORTANTE:**
- **Name**: Digite `Doc Permite App`
- **Supported account types**: Marque a **PRIMEIRA opção** (Single tenant)
- **Redirect URI**: 
  - No dropdown da esquerda, selecione: **"Single-page application (SPA)"**
  - No campo da direita, digite: `http://localhost`

Depois clique em **"Register"** ou **"Registrar"**

---

## 📍 PASSO 5: COPIAR O CLIENT ID ⭐⭐⭐

Após clicar em Register, você será levado para uma tela chamada **"Overview"** (Visão geral).

**ESSA É A TELA MAIS IMPORTANTE!**

Você verá algo assim:

```
┌────────────────────────────────────────────────────────┐
│  Doc Permite App                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Essentials (Informações essenciais)                   │
│                                                        │
│  Display name (Nome de exibição)                       │
│  Doc Permite App                                       │
│                                                        │
│  Application (client) ID  📋                           │
│  a1b2c3d4-e5f6-7890-1234-567890abcdef    ← COPIE ISSO!│
│                                                        │
│  Directory (tenant) ID  📋                             │
│  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                 │
│                                                        │
│  Object ID  📋                                         │
│  yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**O QUE FAZER:**
1. Procure por **"Application (client) ID"**
2. Você verá um código tipo: `a1b2c3d4-e5f6-7890-1234-567890abcdef`
3. Clique no ícone de **copiar** 📋 ao lado do código
4. **GUARDE ESSE CÓDIGO!** Você vai precisar dele!

---

## 📍 PASSO 6: Configurar Permissões de E-mail

Ainda na mesma tela do app, no menu lateral **ESQUERDO**, procure por:

```
┌────────────────────────────────────────────────────────┐
│  Doc Permite App                                       │
├────────────────────────────────────────────────────────┤
│  🏠 Overview                                           │
│  🔐 Authentication                                     │
│  🎫 Certificates & secrets                            │
│  🔓 API permissions                          ← CLIQUE  │
│  📤 Expose an API                                     │
│  🏷️ Branding & properties                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

1. Clique em **"API permissions"** ou **"Permissões de API"**

Você verá:

```
┌────────────────────────────────────────────────────────┐
│  API permissions | Permissões de API                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [+ Add a permission] [+ Adicionar permissão] ← CLIQUE│
│                                                        │
│  Configured permissions (Permissões configuradas)      │
│  ┌──────────────────────────────────────────────┐    │
│  │ User.Read (já vem por padrão)                │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

2. Clique em **"+ Add a permission"** ou **"+ Adicionar permissão"**

---

## 📍 PASSO 7: Adicionar Permissão Mail.Send

Aparecerá um painel lateral:

```
┌────────────────────────────────────────────────────────┐
│  Request API permissions                               │
│  Solicitar permissões de API                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Microsoft APIs                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 📊 Microsoft Graph                  ← CLIQUE  │    │
│  │ 📧 Office 365 Management APIs                │    │
│  │ 🔐 Azure Active Directory Graph              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

1. Clique em **"Microsoft Graph"**

Depois você verá:

```
┌────────────────────────────────────────────────────────┐
│  Microsoft Graph                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  What type of permissions does your application       │
│  require?                                              │
│                                                        │
│  ○ Delegated permissions              ← MARQUE ESSA   │
│     (usuário precisa estar logado)                    │
│                                                        │
│  ○ Application permissions                            │
│     (app funciona sozinho)                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

2. Marque **"Delegated permissions"** ou **"Permissões delegadas"**

Agora você verá uma lista de permissões:

```
┌────────────────────────────────────────────────────────┐
│  Select permissions                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔍 Search permissions...                             │
│  ┌──────────────────────────────────────────────┐    │
│  │ Mail.Send                                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ☐ Mail.Read                                          │
│  ☑ Mail.Send                              ← MARQUE    │
│  ☐ Mail.ReadWrite                                     │
│                                                        │
│  [Add permissions] [Adicionar permissões]  ← CLIQUE   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

3. Na caixa de busca, digite: **"Mail.Send"**
4. Marque a caixinha ☑ ao lado de **"Mail.Send"**
5. Clique em **"Add permissions"** ou **"Adicionar permissões"**

---

## 📍 PASSO 8: Colar o Client ID no Código

1. Abra o arquivo **`auth.js`** no seu computador
2. Encontre a linha 7:
   ```javascript
   clientId: 'SEU_CLIENT_ID_AQUI',
   ```
3. Substitua por (cole o ID que você copiou):
   ```javascript
   clientId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
   ```

**EXEMPLO REAL:**
Se o seu Client ID for: `12345678-90ab-cdef-1234-567890abcdef`

O código deve ficar:
```javascript
clientId: '12345678-90ab-cdef-1234-567890abcdef',
```

---

## ✅ PRONTO! AGORA TESTE

1. Abra o arquivo **`index.html`** no navegador
2. Preencha o formulário
3. Clique em **"Enviar Documentos"**
4. Uma janela popup vai abrir pedindo login da Microsoft
5. Faça login com sua conta da empresa
6. Autorize as permissões
7. O e-mail será enviado automaticamente para **doc.permite@per.com.br**!

---

## 🆘 AINDA COM DÚVIDAS?

Se você não conseguir fazer sozinho, peça ajuda para o **administrador de TI** da empresa. Ele pode criar o app registration para você e te passar o Client ID pronto!
