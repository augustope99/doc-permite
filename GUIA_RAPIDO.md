# 🔧 GUIA RÁPIDO - Configuração Azure AD

## ⚠️ VOCÊ ESTÁ VENDO ESSE ERRO PORQUE:

O arquivo `auth.js` ainda tem o texto `'SEU_CLIENT_ID_AQUI'` que precisa ser substituído pelo ID real do aplicativo Azure.

---

## 📝 PASSO A PASSO COMPLETO:

### 1️⃣ Acessar Azure Portal
- Vá em: https://portal.azure.com
- Faça login com sua conta Microsoft da empresa (PER INTERMEDIACAO DE PAGAMENTOS)

### 2️⃣ Criar App Registration
1. No menu lateral, procure por **"Azure Active Directory"**
2. Clique em **"App registrations"** (Registros de aplicativo)
3. Clique em **"+ New registration"** (Novo registro)

### 3️⃣ Preencher o Formulário
- **Name (Nome)**: `Doc Permite App`
- **Supported account types**: Selecione a **primeira opção**:
  - "Accounts in this organizational directory only (PER INTERMEDIACAO DE PAGAMENTOS only - Single tenant)"
- **Redirect URI**:
  - Tipo: **Single-page application (SPA)**
  - URL: Cole a URL onde o site está hospedado
    - Se for local: `http://localhost` ou `http://127.0.0.1`
    - Se for GitHub Pages: `https://seu-usuario.github.io/seu-repositorio/`
- Clique em **"Register"**

### 4️⃣ Copiar o Client ID
1. Após criar, você verá a página **Overview** do app
2. Procure por **"Application (client) ID"**
3. **COPIE** esse ID (formato: `12345678-1234-1234-1234-123456789abc`)

### 5️⃣ Configurar Permissões
1. No menu lateral do app, clique em **"API permissions"**
2. Clique em **"+ Add a permission"**
3. Selecione **"Microsoft Graph"**
4. Selecione **"Delegated permissions"**
5. Procure e marque: **"Mail.Send"**
6. Clique em **"Add permissions"**
7. ⚠️ IMPORTANTE: Clique em **"Grant admin consent for [sua empresa]"** (se disponível)

### 6️⃣ Atualizar o Código
1. Abra o arquivo **`auth.js`**
2. Na linha 7, substitua:
   ```javascript
   clientId: 'SEU_CLIENT_ID_AQUI',
   ```
   Por:
   ```javascript
   clientId: '12345678-1234-1234-1234-123456789abc', // Cole o ID que você copiou
   ```

### 7️⃣ Atualizar Redirect URI (se necessário)
Se estiver usando GitHub Pages ou outro domínio:
1. No Azure, vá em **"Authentication"**
2. Em **"Single-page application"**, adicione a URL correta
3. Salve

---

## ✅ TESTAR

1. Abra o arquivo `index.html` no navegador
2. Preencha o formulário
3. Clique em "Enviar Documentos"
4. Uma janela popup do Microsoft deve aparecer pedindo login
5. Faça login com sua conta da empresa
6. Autorize as permissões
7. O e-mail será enviado automaticamente!

---

## 🆘 PROBLEMAS COMUNS

**Erro: "AADSTS700016"**
- Você não substituiu o Client ID no auth.js

**Erro: "AADSTS50011: redirect_uri mismatch"**
- A URL no código não corresponde à URL configurada no Azure
- Verifique o Redirect URI no Azure e no auth.js

**Erro: "Insufficient privileges"**
- Falta dar consentimento de admin nas permissões
- Vá em API permissions > Grant admin consent

**Popup não abre**
- Verifique se o navegador não está bloqueando popups
- Permita popups para o site

---

## 📧 RESULTADO FINAL

Quando funcionar:
- ✅ Login automático com Microsoft
- ✅ E-mail enviado para: doc.permite@per.com.br
- ✅ Assunto: "Novo - Credenciamento"
- ✅ Anexos incluídos automaticamente
- ✅ Dados formatados em tabela HTML
