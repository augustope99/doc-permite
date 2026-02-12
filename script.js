document.getElementById('fotoTermo').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name;
    const fileNameDiv = this.parentElement.querySelector('.file-name');
    if (fileName) {
        fileNameDiv.textContent = `Arquivo selecionado: ${fileName}`;
    }
});

document.getElementById('cnpj').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        e.target.value = value;
    }
});

document.getElementById('whatsapp').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    }
});

document.getElementById('docForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const message = document.getElementById('message');
    
    loading.classList.remove('hidden');
    message.classList.add('hidden');
    
    try {
        const termoFile = document.getElementById('fotoTermo').files[0];
        const compFile = document.querySelectorAll('input[type="file"]')[1].files[0];
        
        const attachments = [];
        
        if (termoFile) {
            const termoBase64 = await fileToBase64(termoFile);
            attachments.push({
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: termoFile.name,
                contentBytes: termoBase64
            });
        }
        
        if (compFile) {
            const compBase64 = await fileToBase64(compFile);
            attachments.push({
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: compFile.name,
                contentBytes: compBase64
            });
        }
        
        const emailBody = `
            <h2 style="color: #8B0000;">Novo Documento Recebido - Doc Permite</h2>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Especialista/Executivo:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('especialista')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Qtde de POS:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('qtdePos')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Possui Accelere:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('accelere')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Filial:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('filial')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Marca:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('marca')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Código do Cliente:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('codigoCliente')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CNPJ:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cnpj')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Razão Social:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('razaoSocial')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nome Fantasia:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('nomeFantasia')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">E-mail:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('email')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Quem Sugeriu:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('quemSugeriu')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Principal Contato:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('principalContato')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">WhatsApp:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('whatsapp')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Data de Envio:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('dataRecebimento')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tipo Credenciamento:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('tipoCredenciamento')}</td>
                </tr>
            </table>
        `;
        
        await sendEmail({
            to: 'docpermite@per.com.br',
            subject: 'Novo - Credenciamento',
            body: emailBody,
            attachments: attachments
        });
        
        loading.classList.add('hidden');
        message.classList.remove('hidden');
        message.classList.add('success');
        message.textContent = 'E-mail enviado com sucesso para docpermite@per.com.br!';
        form.reset();
        document.querySelectorAll('.file-name').forEach(el => el.textContent = '');
        
        setTimeout(() => {
            message.classList.add('hidden');
        }, 5000);
        
    } catch (error) {
        loading.classList.add('hidden');
        message.classList.remove('hidden');
        message.classList.add('error');
        message.textContent = 'Erro ao enviar e-mail. Faça login no Outlook e tente novamente.';
        console.error('Erro:', error);
    }
});
