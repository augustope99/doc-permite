# ⚠️ ERRO: Tenant Incorreto

## 🔴 O PROBLEMA:

Você está tentando fazer login com uma conta do diretório **"Educacional"**, mas o aplicativo foi registrado no diretório **"PER INTERMEDIACAO DE PAGAMENTOS"**.

---

## ✅ SOLUÇÃO:

### Opção 1: Usar Conta Corporativa (RECOMENDADO)

1. Quando o popup de login aparecer
2. **NÃO** use conta pessoal (@hotmail, @outlook, @gmail)
3. **NÃO** use conta educacional (@estudante, @aluno)
4. **USE** a conta da empresa: **seuemail@per.com.br**

---

### Opção 2: Limpar Cache e Tentar Novamente

1. Feche todos os navegadores
2. Abra o navegador em **modo anônimo/privado**
3. Acesse: http://localhost:8080
4. Tente fazer login novamente com **@per.com.br**

---

### Opção 3: Deslogar de Todas as Contas Microsoft

1. Acesse: https://login.microsoftonline.com/common/oauth2/logout
2. Feche o navegador
3. Abra novamente
4. Acesse: http://localhost:8080
5. Faça login com **@per.com.br**

---

## 🆘 SE VOCÊ NÃO TEM CONTA @per.com.br

Se você não tem uma conta corporativa da PER, você tem 2 opções:

### Opção A: Pedir para o Administrador

Peça para o administrador de TI da PER:
1. Criar uma conta Microsoft 365 para você
2. OU dar permissão para sua conta atual acessar o app

### Opção B: Recriar o App como Multi-Tenant

1. Vá no Azure Portal
2. Acesse o app **"Doc Permite App"**
3. Vá em **"Authentication"**
4. Em **"Supported account types"**, clique em **"Edit"**
5. Mude para: **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"**
6. Salve

Depois, atualize o `auth.js`:
```javascript
authority: 'https://login.microsoftonline.com/common',
```

---

## 📧 QUAL CONTA USAR?

✅ **CORRETO:**
- seunome@per.com.br
- usuario@per.com.br
- qualquer@per.com.br

❌ **ERRADO:**
- seunome@hotmail.com
- seunome@outlook.com
- seunome@gmail.com
- seunome@estudante.com
- Qualquer conta que NÃO seja @per.com.br

---

## 🔍 COMO SABER QUAL CONTA ESTOU USANDO?

Quando o popup de login aparecer, verifique:
- Se aparecer uma lista de contas, escolha a que termina com **@per.com.br**
- Se não tiver nenhuma @per.com.br, clique em **"Use another account"**
- Digite o e-mail completo: **seuemail@per.com.br**
