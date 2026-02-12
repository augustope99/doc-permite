# Landing Page Doc Permite

## Descrição
Landing page para envio automático de documentos de credenciamento para o e-mail DOCPERMITE.

## Arquivos
- `index.html` - Estrutura da página com formulário
- `styles.css` - Estilização da página
- `script.js` - Lógica de envio e validação

## Campos do Formulário
- Especialista / Executivo
- EC
- Qtde de POS
- Possui Accelere?
- Filial
- Marca
- Código do Cliente
- CNPJ
- Razão Social
- Nome Fantasia
- E-mail
- Usuário
- Quem Sugeriu?
- Principal Contato
- WhatsApp
- Data de Recebimento de Docs
- Tipo Credenciamento
- Tempo Credenciamento
- Comprovante Bancário
- Termo Adesão
- Anexo: Foto do Termo de Adesão

## Configuração do Power Automate

### Passo 1: Criar o Flow
1. Acesse Power Automate (https://make.powerautomate.com)
2. Crie um novo flow automatizado
3. Escolha o gatilho: "Quando um novo e-mail chegar" (Office 365 Outlook)

### Passo 2: Configurar o Gatilho
- **Pasta**: Caixa de Entrada
- **Filtro de Assunto**: "Doc Permite -"
- **Incluir Anexos**: Sim

### Passo 3: Adicionar Ação - Analisar HTML
- Use "Compor" para extrair dados do corpo do e-mail HTML

### Passo 4: Adicionar Ação - Criar Item no SharePoint
- **Site**: [URL do seu site SharePoint]
- **Lista**: [Nome da lista/planilha]
- **Campos**: Mapear cada campo extraído do e-mail

### Exemplo de Mapeamento:
```
Especialista: xpath(xml(body('Analisar_HTML')), '//td[contains(text(),"Especialista")]/following-sibling::td/text()')
EC: xpath(xml(body('Analisar_HTML')), '//td[contains(text(),"EC:")]/following-sibling::td/text()')
...
```

### Passo 5: Salvar Anexo no SharePoint
- Adicione ação "Criar arquivo" no SharePoint
- Use o conteúdo do anexo do e-mail

## Integração com Backend (Opcional)

Para envio real de e-mail, você precisará de um backend. Opções:

### Opção 1: Power Automate HTTP Request
Modifique o `script.js` para fazer POST para um endpoint do Power Automate:

```javascript
const response = await fetch('https://prod-xx.westus.logic.azure.com:443/workflows/...', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
});
```

### Opção 2: Azure Function
Crie uma Azure Function para processar e enviar e-mails.

### Opção 3: Microsoft Graph API
Use Graph API para enviar e-mails diretamente.

## Como Usar
1. Abra o arquivo `index.html` em um navegador
2. Preencha todos os campos obrigatórios
3. Anexe a foto do termo de adesão
4. Clique em "Enviar Documentos"
5. O Power Automate processará automaticamente o e-mail

## Observações
- Todos os campos são obrigatórios
- CNPJ e WhatsApp possuem formatação automática
- Aceita imagens e PDFs como anexo
- O e-mail de destino deve ser configurado no script.js (linha 39)
