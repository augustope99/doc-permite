# 🚀 DEPLOY NO GITHUB PAGES

## 📋 PASSO 1: Criar Repositório no GitHub

1. Acesse: https://github.com/augustope99
2. Clique em **"New"** (Novo repositório)
3. Preencha:
   - **Repository name**: `doc-permite`
   - **Description**: Landing Page Doc Permite - Envio de Documentos
   - **Public** (marque essa opção)
   - **NÃO** marque "Add a README file"
4. Clique em **"Create repository"**

---

## 📋 PASSO 2: Subir os Arquivos

### Opção A: Usando o Script Automático (RECOMENDADO)

1. Dê duplo clique no arquivo **`subir_github.bat`**
2. Se pedir login do GitHub, faça login
3. Aguarde finalizar
4. Pronto!

### Opção B: Manualmente

Abra o Prompt de Comando na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "Deploy: Landing Page Doc Permite"
git branch -M main
git remote add origin https://github.com/augustope99/doc-permite.git
git push -u origin main
```

---

## 📋 PASSO 3: Ativar GitHub Pages

1. Vá em: https://github.com/augustope99/doc-permite
2. Clique em **"Settings"** (Configurações)
3. No menu lateral, clique em **"Pages"**
4. Em **"Source"**, selecione:
   - Branch: **main**
   - Folder: **/ (root)**
5. Clique em **"Save"**
6. Aguarde 1-2 minutos

---

## 📋 PASSO 4: Atualizar Azure com URL do GitHub Pages

1. Acesse: https://portal.azure.com
2. Vá em **Microsoft Entra ID** > **App registrations** > **Doc Permite App**
3. Clique em **"Authentication"**
4. Em **"Single-page application"**, clique em **"+ Add URI"**
5. Digite: `https://augustope99.github.io/doc-permite/`
6. Clique em **"Save"**

---

## 📋 PASSO 5: Atualizar o Código

Edite o arquivo **`auth.js`** e altere a linha do redirectUri:

**DE:**
```javascript
redirectUri: 'http://localhost:8080'
```

**PARA:**
```javascript
redirectUri: window.location.origin
```

Depois, suba novamente:
```bash
git add .
git commit -m "Atualiza redirect URI"
git push
```

---

## ✅ PRONTO!

Seu site estará disponível em:
**https://augustope99.github.io/doc-permite/**

---

## 🔄 PARA ATUALIZAR O SITE

Sempre que fizer alterações:

1. Dê duplo clique em **`subir_github.bat`**
2. Aguarde 1-2 minutos
3. Atualize a página no navegador

Ou manualmente:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```

---

## 🆘 PROBLEMAS COMUNS

**"git não é reconhecido como comando"**
- Instale o Git: https://git-scm.com/download/win
- Reinicie o computador após instalar

**"Permission denied (publickey)"**
- Configure suas credenciais do GitHub:
  ```bash
  git config --global user.name "augustope99"
  git config --global user.email "seu-email@exemplo.com"
  ```

**"Site não carrega no GitHub Pages"**
- Aguarde 2-5 minutos após o primeiro deploy
- Verifique se o GitHub Pages está ativado em Settings > Pages
- Limpe o cache do navegador (Ctrl + Shift + Delete)

**"Erro de autenticação no Azure"**
- Certifique-se que adicionou a URL do GitHub Pages no Azure
- Verifique se o redirectUri no auth.js está correto
- Limpe os cookies do navegador

---

## 📧 RESULTADO FINAL

Quando tudo estiver funcionando:
- ✅ Site online: https://augustope99.github.io/doc-permite/
- ✅ Login automático com Microsoft
- ✅ E-mail enviado para: docpermite@per.com.br
- ✅ Anexos incluídos automaticamente
- ✅ Dados formatados para Power Automate
