// Função genérica para exibir o nome do arquivo selecionado.
function handleFileChange(event) {
    const input = event.target;
    const fileName = input.files[0]?.name;
    // Encontra o elemento .file-name dentro do mesmo container pai.
    const fileNameDiv = input.parentElement.querySelector('.file-name');
    if (fileNameDiv) {
        fileNameDiv.textContent = fileName ? `Arquivo selecionado: ${fileName}` : '';
    }
}

// Adiciona o listener para ambos os inputs de arquivo.
document.getElementById('compBancario').addEventListener('change', handleFileChange);

// --- LÓGICA DO CAMPO DE ASSINATURA ---
const canvas = document.getElementById('signature-pad');
const signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)' // Necessário para exportar como imagem com fundo branco
});

function resizeCanvas() {
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear(); // Limpa para redimensionar corretamente
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.getElementById('clear-signature').addEventListener('click', () => signaturePad.clear());

// Garante que o campo de Qtde POS aceite apenas números
document.getElementById('qtdePos').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Abre o calendário nativo ao clicar no input de data
const dateInput = document.getElementById('dataRecebimento');
dateInput.addEventListener('click', function() {
    // showPicker() é suportado na maioria dos navegadores modernos
    if (this.showPicker) this.showPicker();
});

const cnpjMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 14); // Limita a 14 dígitos numéricos
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    e.target.value = value;
};

// --- FUNÇÕES DE MÁSCARA PARA NOVOS CAMPOS ---

const phoneMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 11);
    value = value.replace(/^(\d\d)(\d)/g, '($1) $2');
    value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    e.target.value = value;
};

const cpfMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = value;
};

const cepMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 8);
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value;
};

// Adiciona listeners para os campos com máscara
document.getElementById('cnpj').addEventListener('input', cnpjMask);
document.getElementById('whatsapp').addEventListener('input', phoneMask);
document.getElementById('telefone1').addEventListener('input', phoneMask);
document.getElementById('telefone2').addEventListener('input', phoneMask);

document.getElementById('cep').addEventListener('input', cepMask);

document.getElementById('cpfResponsavel').addEventListener('input', cpfMask);
document.getElementById('cpfSocio2').addEventListener('input', cpfMask);
document.getElementById('cpfSocio3').addEventListener('input', cpfMask);
document.getElementById('cpfSocio4').addEventListener('input', cpfMask);


// --- LÓGICA DE ENVIO DO FORMULÁRIO ---

// Função auxiliar para criar um objeto de anexo.
// Assume que a função `fileToBase64` já existe e retorna a string base64 pura (sem o prefixo data:).
async function createFileAttachment(file) {
    if (!file) return null;
    const contentBytes = await fileToBase64(file);
    return {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: file.name,
        contentBytes: contentBytes
    };
}

document.getElementById('docForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const loading = document.getElementById('loading');
    const message = document.getElementById('message');
    
    loading.classList.remove('hidden');
    message.classList.add('hidden');
    
    try {
        // Validação da assinatura
        if (signaturePad.isEmpty()) {
            alert('Por favor, forneça a assinatura do termo de adesão.');
            loading.classList.add('hidden');
            return; // Interrompe o envio
        }

        // Captura os valores dos checkboxes de segmento
        const segmentos = formData.getAll('segmento').join(', ') || 'Nenhum';

        // Cria o anexo da assinatura
        const signatureBase64 = signaturePad.toDataURL('image/png').split(',')[1];
        const signatureAttachment = {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: `assinatura_termo_${formData.get('cnpj') || 'cliente'}.png`,
            contentBytes: signatureBase64
        };

        // Pega o outro arquivo (comprovante)
        const compFile = document.getElementById('compBancario')?.files[0];
        const compAttachment = await createFileAttachment(compFile);
        
        const attachments = [signatureAttachment];
        if (compAttachment) attachments.push(compAttachment);
        
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
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Segmento:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${segmentos}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CEP:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cep')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Logradouro:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('logradouro')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Número:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('numero')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Complemento:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('complemento')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Bairro:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('bairro')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Cidade:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cidade')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">UF:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('uf')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">E-mail Principal:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('email')}</td>
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
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefone 1:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('telefone1')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefone 2:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('telefone2')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Responsável Legal:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('responsavelLegal')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CPF (Responsável Legal):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cpfResponsavel')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sócio 2:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('socio2')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CPF (Sócio 2):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cpfSocio2')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sócio 3:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('socio3')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CPF (Sócio 3):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cpfSocio3')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sócio 4:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('socio4')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CPF (Sócio 4):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cpfSocio4')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Quem Sugeriu:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('quemSugeriu')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Data de Envio:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('dataRecebimento')}</td>
                </tr>
                <tr>
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
        signaturePad.clear();
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
