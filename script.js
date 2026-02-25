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
const canvasSubadquirente = document.getElementById('signature-pad-subadquirente');
const signaturePadSubadquirente = new SignaturePad(canvasSubadquirente, {
    backgroundColor: 'rgb(255, 255, 255)' // Necessário para exportar como imagem com fundo branco
});

const canvasEstabelecimento = document.getElementById('signature-pad-estabelecimento');
const signaturePadEstabelecimento = new SignaturePad(canvasEstabelecimento, {
    backgroundColor: 'rgb(255, 255, 255)' // Necessário para exportar como imagem com fundo branco
});

function resizeCanvas() {
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);

    // Redimensiona o canvas do Subadquirente
    canvasSubadquirente.width = canvasSubadquirente.offsetWidth * ratio;
    canvasSubadquirente.height = canvasSubadquirente.offsetHeight * ratio;
    canvasSubadquirente.getContext("2d").scale(ratio, ratio);
    signaturePadSubadquirente.clear();

    // Redimensiona o canvas do Estabelecimento
    canvasEstabelecimento.width = canvasEstabelecimento.offsetWidth * ratio;
    canvasEstabelecimento.height = canvasEstabelecimento.offsetHeight * ratio;
    canvasEstabelecimento.getContext("2d").scale(ratio, ratio);
    signaturePadEstabelecimento.clear();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.getElementById('clear-signature-subadquirente').addEventListener('click', () => signaturePadSubadquirente.clear());
document.getElementById('clear-signature-estabelecimento').addEventListener('click', () => signaturePadEstabelecimento.clear());

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

// Preenche os campos de data (dia, mês, ano) com a data atual
function preencherDataAtual() {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.toLocaleString('pt-BR', { month: 'long' });
    const ano = hoje.getFullYear();

    // Capitaliza a primeira letra do mês
    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

    document.getElementById('dia').value = dia;
    document.getElementById('mes').value = mesCapitalizado;
    document.getElementById('ano').value = ano;
}

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

const numericMask = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
};

const accountMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 12); // Example limit
    value = value.replace(/(\d{1,11})(\d{1})$/, '$1-$2');
    e.target.value = value;
};

// --- FUNÇÕES DE VALIDAÇÃO ---

/**
 * Valida um CNPJ usando o algoritmo do Módulo 11.
 * @param {string} cnpj - O CNPJ para validar (pode conter máscara).
 * @returns {boolean} - True se o CNPJ for válido, false caso contrário.
 */
function isValidCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj === '') return false;
    if (cnpj.length !== 14) return false;

    // Elimina CNPJs invalidos conhecidos (todos os dígitos iguais)
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

    return true;
}

/**
 * Manipulador de evento para validar o campo CNPJ quando o usuário sai dele.
 * @param {Event} event - O evento de blur.
 */
function handleCnpjValidation(event) {
    const input = event.target;
    const cnpj = input.value;

    if (cnpj.length === 0) { // Não valida campo vazio
        input.classList.remove('invalid-field');
        return;
    }

    if (!isValidCNPJ(cnpj)) {
        input.classList.add('invalid-field');
        alert(`O CNPJ "${cnpj}" é inválido. Por favor, verifique.`);
    } else {
        input.classList.remove('invalid-field');
    }
}

// --- LÓGICA DE VALIDAÇÃO COMPLICE (QI TECH) ---
let usuarioAprovado = false;
let consultaEmAndamento = false;

/**
 * Manipulador de evento para o campo CNPJ principal, que valida e busca dados da empresa.
 * @param {Event} event - O evento de blur.
 */
async function handleMainCnpjBlur(event) {
    const input = event.target;
    const cnpj = input.value;
    const cleanedCnpj = cnpj.replace(/\D/g, '');

    // 1. Limpa a classe de erro
    input.classList.remove('invalid-field');

    if (cnpj.length === 0) {
        return;
    }

    // 2. Valida o CNPJ
    if (!isValidCNPJ(cnpj)) {
        input.classList.add('invalid-field');
        alert(`O CNPJ "${cnpj}" é inválido. Por favor, verifique.`);
        return; // Para a execução se for inválido
    }

    // Dispara a validação Complice
    // O backend agora espera um analysis_id.
    // Se o fluxo for consultar pelo CNPJ (assumindo que o ID foi gerado como CNPJ_TIMESTAMP ou similar),
    // ou se o usuário deve colar o ID no campo, a variável enviada deve ser adequada.
    usuarioAprovado = await validarComplice(cleanedCnpj); 

    // 3. Se for válido, busca os dados na API
    input.disabled = true;
    const originalPlaceholder = input.placeholder;
    input.placeholder = "Buscando dados...";

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCnpj}`);
        if (!response.ok) {
            throw new Error('CNPJ não encontrado ou API indisponível.');
        }
        const data = await response.json();

        // Preenche os campos de endereço e dados da empresa
        document.getElementById('razaoSocial').value = data.razao_social || '';
        document.getElementById('nomeFantasia').value = data.nome_fantasia || '';
        document.getElementById('cep').value = data.cep || '';
        document.getElementById('logradouro').value = data.logradouro || '';
        document.getElementById('numero').value = data.numero || '';
        document.getElementById('complemento').value = data.complemento || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.municipio || '';
        document.getElementById('uf').value = data.uf || '';
        
        // Aplica a máscara no CEP que foi preenchido
        const cepInput = document.getElementById('cep');
        if (cepInput.value) cepMask({ target: cepInput });

    } catch (error) {
        console.error('Erro ao buscar dados do CNPJ:', error);
        alert(`Não foi possível preencher os dados automaticamente. Por favor, preencha manualmente.\nMotivo: ${error.message}`);
    } finally {
        input.disabled = false;
        input.placeholder = originalPlaceholder;
    }
}

// Adiciona listeners para os campos com máscara
document.getElementById('cnpj').addEventListener('input', (e) => {
    // Aplica a máscara primeiro
    cnpjMask(e);

    // Reseta o status de aprovação se o CNPJ for alterado
    if (usuarioAprovado) {
        console.log('CNPJ alterado. Status de aprovação reiniciado.');
        usuarioAprovado = false;
        const submitBtn = document.getElementById('main-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.style.opacity = '0.6';
        }
        // Limpa popups anteriores
        const popup = document.getElementById('complice-popup');
        if (popup && !popup.classList.contains('hidden')) {
            popup.classList.add('hidden');
        }
    }
});
document.getElementById('cnpj').addEventListener('blur', handleMainCnpjBlur);
document.getElementById('whatsapp').addEventListener('input', phoneMask);
document.getElementById('telefone1').addEventListener('input', phoneMask);
document.getElementById('telefone2').addEventListener('input', phoneMask);

document.getElementById('cep').addEventListener('input', cepMask);
document.getElementById('cep').addEventListener('blur', searchCep); // Adiciona o listener para buscar o CEP

document.getElementById('cpfResponsavel').addEventListener('input', cpfMask);
document.getElementById('cpfSocio2').addEventListener('input', cpfMask);
document.getElementById('cpfSocio3').addEventListener('input', cpfMask);
document.getElementById('cpfSocio4').addEventListener('input', cpfMask);

document.getElementById('cnpjConta').addEventListener('input', cnpjMask);
document.getElementById('cnpjConta').addEventListener('blur', handleCnpjValidation);
document.getElementById('codigoBanco').addEventListener('input', numericMask);
document.getElementById('agencia').addEventListener('input', numericMask);
document.getElementById('contaDigito').addEventListener('input', accountMask);

// --- SINCRONIZAÇÃO DE CAMPOS DE ASSINATURA ---
const filialInput = document.getElementById('filial');
const especialistaInput = document.getElementById('especialista');

filialInput.addEventListener('input', () => {
    document.getElementById('filialAssinatura').value = filialInput.value;
});

especialistaInput.addEventListener('input', () => {
    document.getElementById('especialistaAssinatura').value = especialistaInput.value;
});

// --- LÓGICA DO CONTADOR DE CARACTERES ---
const chavePixInput = document.getElementById('chavePix');
const chavePixCounter = document.getElementById('chavePixCounter');

chavePixInput.addEventListener('input', () => {
    const count = chavePixInput.value.length;
    chavePixCounter.textContent = `(${count} caracteres)`;
});

// --- LÓGICA PARA BUSCAR ENDEREÇO PELO CEP ---
async function searchCep() {
    const cepInput = document.getElementById('cep');
    let cep = cepInput.value.replace(/\D/g, ''); // Remove non-digits

    // Limpa os campos de endereço antes de buscar
    document.getElementById('logradouro').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('uf').value = '';

    if (cep.length !== 8) {
        // Se o CEP não tem 8 dígitos, não faz a busca
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado ou inválido.');
            return;
        }

        // Preenche os campos com os dados retornados pela API
        document.getElementById('logradouro').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('cidade').value = data.localidade; // ViaCEP usa 'localidade' para cidade
        document.getElementById('uf').value = data.uf;             // ViaCEP usa 'uf' para estado

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Verifique sua conexão ou tente novamente.');
    }
}

// Preenche a data e captura informações do visitante ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    preencherDataAtual();
    logVisitorInfo();
    injectHtmlElements();
    const submitBtn = document.getElementById('main-submit-btn');
    submitBtn.disabled = true;
    submitBtn.style.cursor = 'not-allowed';
    submitBtn.style.opacity = '0.6';
});

// --- LÓGICA PARA CAPTURAR INFORMAÇÕES DO VISITANTE ---
async function logVisitorInfo() {
    const accessTime = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    document.getElementById('accessTime').value = accessTime;

    try {
        // Usando ipinfo.io para obter IP e localização (não requer chave para uso básico)
        const response = await fetch('https://ipinfo.io/json');
        if (!response.ok) {
            throw new Error('Falha ao obter dados de geolocalização.');
        }
        const data = await response.json();
        
        const ip = data.ip || 'Não disponível';
        const city = data.city || 'N/A';
        const region = data.region || 'N/A';
        const country = data.country || 'N/A';
        const location = `${city}, ${region}, ${country}`;

        document.getElementById('visitorIp').value = ip;
        document.getElementById('visitorLocation').value = location;

    } catch (error) {
        console.error('Erro ao capturar informações do visitante:', error);
        document.getElementById('visitorIp').value = 'Erro na captura';
        document.getElementById('visitorLocation').value = 'Erro na captura';
    }
}

// --- FUNÇÕES DA VALIDAÇÃO COMPLICE ---

function injectHtmlElements() {
    // Evita criar elementos duplicados se já existirem na página
    if (document.getElementById('complice-loader')) return;

    // Injeta o loader
    const loaderHTML = `
        <div id="complice-loader" class="complice-overlay hidden">
            <div class="complice-loader-content">
                <div class="spinner"></div>
                <p>🔎 Consultando Complice...</p>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);

    // Injeta o popup
    const popupHTML = `
        <div id="complice-popup" class="complice-overlay hidden">
            <div id="complice-popup-content" class="complice-popup-content">
                <div class="icon"></div>
                <p class="message"></p>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Adiciona ID ao botão de submit
    const submitButton = document.querySelector('#docForm .submit-btn');
    if (submitButton) {
        submitButton.id = 'main-submit-btn';
    }

    // Adiciona evento para fechar o popup
    document.getElementById('complice-popup').addEventListener('click', () => {
        document.getElementById('complice-popup').classList.add('hidden');
    });
}

function mostrarPopup(texto, tipo) {
  const popup = document.getElementById('complice-popup');
  const popupContent = document.getElementById('complice-popup-content');
  const iconEl = popupContent.querySelector('.icon');
  const messageEl = popupContent.querySelector('.message');

  popupContent.className = 'complice-popup-content'; // Reseta classes
  messageEl.textContent = texto;
  iconEl.innerHTML = ''; // Limpa o ícone anterior (importante para o spinner)

  switch (tipo) {
    case 'success':
      popupContent.classList.add('sucesso');
      iconEl.textContent = '✅';
      break;
    case 'error':
      popupContent.classList.add('erro');
      iconEl.textContent = '❌';
      break;
    case 'warning': // Para 'pending'
      popupContent.classList.add('alerta');
      iconEl.textContent = '⏳';
      break;
    case 'loading':
      popupContent.classList.add('alerta');
      iconEl.innerHTML = '<div class="spinner"></div>';
      break;
    default: // Fallback para 'alerta'
      popupContent.classList.add('alerta');
      iconEl.textContent = '⚠️';
      break;
  }

  popup.classList.remove('hidden');
}

async function validarComplice(cnpj) {
    if (consultaEmAndamento) return false;
    consultaEmAndamento = true;
    const submitBtn = document.getElementById('main-submit-btn');

    // Garante que o botão esteja desabilitado durante a análise
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.style.opacity = '0.6';
    }

    try {
        mostrarPopup("Analisando usuário no Complice...", "loading");

        const response = await fetch(
            `http://localhost:3000/api/validacao/${cnpj}?nocache=` + Date.now()
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Resposta API:", data);

        // O backend agora retorna { status: "raw_qitech_status" }
        // A lógica abaixo interpreta o status bruto da QI Tech
        if (data.status === "approved" || data.status === "automatically_approved" || data.status === "manually_approved") {
            mostrarPopup("Usuário aprovado no Complice ✅", "success");
            if (submitBtn) { // Habilita o botão
                submitBtn.disabled = false;
                submitBtn.style.cursor = 'pointer';
                submitBtn.style.opacity = '1';
            }
            return true;
        }

        if (data.status === "rejected" || data.status === "blocked") {
            mostrarPopup("Usuário NÃO aprovado ❌", "error");
            return false;
        }

        if (data.status === "pending" || data.status === "in_queue" || data.status === "analyzing") {
            mostrarPopup("Usuário em análise no Complice ⏳", "warning");
            return false;
        }

        mostrarPopup("Erro ao consultar o serviço de validação ⚠️", "error");
        return false;

    } catch (error) {
        console.error("Erro na validação Complice:", error);
        mostrarPopup("Erro ao consultar o serviço de validação ⚠️", "error");
        return false;
    } finally {
        consultaEmAndamento = false;
    }
}

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
    
    // Validação de aprovação Complice
    if (!usuarioAprovado) {
        mostrarPopup('❌ Envio bloqueado. O CNPJ principal não foi aprovado na consulta.', 'erro');
        const cnpjInput = document.getElementById('cnpj');
        cnpjInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cnpjInput.focus();
        return;
    }

    loading.classList.remove('hidden');
    message.classList.add('hidden');
    
    // --- VALIDAÇÃO DE CNPJ ANTES DO ENVIO ---
    const cnpjInput = document.getElementById('cnpj');
    if (!isValidCNPJ(cnpjInput.value)) {
        loading.classList.add('hidden');
        alert('O CNPJ principal é inválido. Por favor, corrija antes de enviar.');
        cnpjInput.focus();
        cnpjInput.classList.add('invalid-field');
        return;
    }

    const cnpjContaInput = document.getElementById('cnpjConta');
    if (!isValidCNPJ(cnpjContaInput.value)) {
        loading.classList.add('hidden');
        alert('O CNPJ do titular da conta é inválido. Por favor, corrija antes de enviar.');
        cnpjContaInput.focus();
        cnpjContaInput.classList.add('invalid-field');
        return;
    }
    // --- FIM DA VALIDAÇÃO ---

    try {
        // Validação da assinatura
        if (signaturePadSubadquirente.isEmpty() || signaturePadEstabelecimento.isEmpty()) {
            alert('Por favor, preencha ambas as assinaturas (SUBADQUIRENTE e ESTABELECIMENTO).');
            loading.classList.add('hidden');
            return; // Interrompe o envio
        }

        // Captura os valores dos checkboxes de segmento
        const segmentos = formData.getAll('segmento').join(', ') || 'Nenhum';

        // Cria o anexo da assinatura do Subadquirente
        const signatureSubadquirenteBase64 = signaturePadSubadquirente.toDataURL('image/png').split(',')[1];
        const signatureSubadquirenteAttachment = {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: `assinatura_subadquirente_${formData.get('cnpj') || 'cliente'}.png`,
            contentBytes: signatureSubadquirenteBase64
        };

        // Cria o anexo da assinatura do Estabelecimento
        const signatureEstabelecimentoBase64 = signaturePadEstabelecimento.toDataURL('image/png').split(',')[1];
        const signatureEstabelecimentoAttachment = {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: `assinatura_estabelecimento_${formData.get('cnpj') || 'cliente'}.png`,
            contentBytes: signatureEstabelecimentoBase64
        };

        // Pega o outro arquivo (comprovante)
        const compFile = document.getElementById('compBancario')?.files[0];
        const compAttachment = await createFileAttachment(compFile);
        
        const attachments = [signatureSubadquirenteAttachment, signatureEstabelecimentoAttachment];
        if (compAttachment) attachments.push(compAttachment);
        
        const emailBody = `
            <h2 style="color: #8B0000;">Novo Documento Recebido - Doc Permite</h2>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Especialista / Executivo:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('especialista')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Qtde de POS:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('qtdePos')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Possui Accelere?:</td>
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

            <h3 style="color: #8B0000; margin-top: 20px; font-family: Arial, sans-serif;">Dados Bancários</h3>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Razão Social da Conta:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('razaoSocialConta')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">CNPJ da Conta:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('cnpjConta')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nome do Banco:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('nomeBanco')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Código do Banco:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('codigoBanco')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Agência:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('agencia')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Conta/Dígito:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('contaDigito')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Chave PIX:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('chavePix')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tipo da Chave PIX:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('tipoChavePix')}</td>
                </tr>
            </table>

            <h3 style="color: #8B0000; margin-top: 20px; font-family: Arial, sans-serif;">Condições Comerciais</h3>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Antecipação Automática:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('antecipacaoAutomatica')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Parcela Vendas:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('parcelaVendas')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Custo da Parcela por conta do:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('porContaEstabelecimento') === 'Sim' ? 'Estabelecimento' : 'Cliente'}</td>
                </tr>
            </table>

            <h3 style="color: #8B0000; margin-top: 20px; font-family: Arial, sans-serif;">Dados da Assinatura</h3>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Filial (Assinatura):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('filialAssinatura')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Especialista PER (Assinatura):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('especialistaAssinatura')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Local:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('local')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Data da Assinatura:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('dia')} de ${formData.get('mes')} de ${formData.get('ano')}</td>
                </tr>
            </table>

            <h3 style="color: #8B0000; margin-top: 20px; font-family: Arial, sans-serif;">Informações de Acesso</h3>
            <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Horário do Acesso:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('accessTime')}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">IP do Visitante:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('visitorIp')}</td>
                </tr>
                <tr style="background-color: #f2f2f2;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Localização (aproximada):</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formData.get('visitorLocation')}</td>
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
        signaturePadSubadquirente.clear();
        signaturePadEstabelecimento.clear();
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
