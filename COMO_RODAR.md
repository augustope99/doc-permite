# 🚀 COMO RODAR O PROJETO LOCALMENTE

## ⚠️ IMPORTANTE: Não abra o arquivo HTML diretamente!

O Azure não aceita `file://` como redirect URI. Você precisa usar um servidor HTTP local.

---

## 📋 PASSO 1: Atualizar Redirect URI no Azure

1. Vá no Azure Portal: https://portal.azure.com
2. Acesse **Microsoft Entra ID** > **App registrations**
3. Clique no app **"Doc Permite App"**
4. Clique em **"Authentication"** no menu lateral
5. Em **"Single-page application"**, clique em **"+ Add URI"**
6. Digite: `http://localhost:8080`
7. Clique em **"Save"**

---

## 📋 PASSO 2: Iniciar o Servidor Local

### Opção 1: Usando o arquivo .bat (Windows)
1. Dê duplo clique no arquivo **`iniciar_servidor.bat`**
2. Uma janela do prompt vai abrir
3. Aguarde aparecer a mensagem de servidor iniciado

### Opção 2: Manualmente
1. Abra o Prompt de Comando (CMD)
2. Navegue até a pasta do projeto:
   ```
   cd "caminho\para\Landing_page_controle_diario"
   ```
3. Execute:
   ```
   python -m http.server 8080
   ```

---

## 📋 PASSO 3: Acessar no Navegador

1. Abra o navegador
2. Acesse: **http://localhost:8080**
3. Preencha o formulário
4. Clique em "Enviar Documentos"
5. Faça login quando o popup aparecer
6. Pronto! E-mail enviado automaticamente!

---

## 🆘 PROBLEMAS COMUNS

**"python não é reconhecido como comando"**
- Instale o Python: https://www.python.org/downloads/
- Durante a instalação, marque "Add Python to PATH"

**"Porta 8080 já está em uso"**
- Mude para outra porta:
  ```
  python -m http.server 8081
  ```
- Atualize o redirect URI no Azure e no auth.js para `http://localhost:8081`

**Erro de redirect URI no Azure**
- Certifique-se que adicionou `http://localhost:8080` no Azure
- Verifique se salvou as alterações

---

## 🌐 PARA SUBIR NO GITHUB PAGES

Quando subir no GitHub Pages:
1. Adicione a URL do GitHub Pages no Azure (Authentication > Add URI)
2. Exemplo: `https://seu-usuario.github.io/seu-repositorio/`
3. O código já está preparado para funcionar em ambos os ambientes
