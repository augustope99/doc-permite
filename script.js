/**
 * script.js - Doc Permite
 * Integração de validação de CNPJ com fluxo de Webhook simulado e UX aprimorada.
 * Versão Final - Simulação de Webhook e Animações
 */

// --- VARIÁVEIS GLOBAIS DE ESTADO ---
let formObserver = null; // Para o IntersectionObserver

// --- FUNÇÕES DE UTILIDADE GERAIS ---

// Função genérica para exibir o nome do arquivo selecionado.
function handleFileChange(event) {
    const input = event.target;
    const fileName = input.files[0]?.name;
    const fileNameDiv = input.parentElement.querySelector('.file-name');
    if (fileNameDiv) {
        fileNameDiv.textContent = fileName ? `Arquivo selecionado: ${fileName}` : '';
    }
}

// Adiciona listener para inputs de arquivo
document.getElementById('compBancario')?.addEventListener('change', handleFileChange);

// --- LÓGICA DO CAMPO DE ASSINATURA (SignaturePad) ---
const canvasSubadquirente = document.getElementById('signature-pad-subadquirente');
const signaturePadSubadquirente = new SignaturePad(canvasSubadquirente, {
    backgroundColor: 'rgb(255, 255, 255)'
});

const canvasEstabelecimento = document.getElementById('signature-pad-estabelecimento');
const signaturePadEstabelecimento = new SignaturePad(canvasEstabelecimento, {
    backgroundColor: 'rgb(255, 255, 255)'
});

function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    
    if (canvasSubadquirente) {
        canvasSubadquirente.width = canvasSubadquirente.offsetWidth * ratio;
        canvasSubadquirente.height = canvasSubadquirente.offsetHeight * ratio;
        canvasSubadquirente.getContext("2d").scale(ratio, ratio);
        signaturePadSubadquirente.clear();
    }

    if (canvasEstabelecimento) {
        canvasEstabelecimento.width = canvasEstabelecimento.offsetWidth * ratio;
        canvasEstabelecimento.height = canvasEstabelecimento.offsetHeight * ratio;
        canvasEstabelecimento.getContext("2d").scale(ratio, ratio);
        signaturePadEstabelecimento.clear();
    }
}
window.addEventListener("resize", resizeCanvas);
// Chama resizeCanvas após o carregamento para garantir dimensões corretas
window.addEventListener('load', resizeCanvas);

document.getElementById('clear-signature-subadquirente')?.addEventListener('click', () => signaturePadSubadquirente.clear());
document.getElementById('clear-signature-estabelecimento')?.addEventListener('click', () => signaturePadEstabelecimento.clear());

// --- MÁSCARAS E FORMATAÇÃO ---

const numericMask = (e) => e.target.value = e.target.value.replace(/\D/g, '');

const cnpjMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 14);
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    e.target.value = value;
};

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

const accountMask = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 12);
    value = value.replace(/(\d{1,11})(\d{1})$/, '$1-$2');
    e.target.value = value;
};

// --- VALIDAÇÃO DE CNPJ (Algoritmo) ---
function isValidCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj === '') return false;
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

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

// --- FUNÇÕES DE UI (POPUP E FORMULÁRIO) ---

function injectHtmlElements() {
    if (document.getElementById('complice-popup')) return;

    // Injeta o popup
    const popupHTML = `
        <div id="complice-popup" class="complice-overlay hidden">
            <div id="complice-popup-content" class="complice-popup-content">
                <div class="icon"></div>
                <p class="message"></p>
                <button id="popup-close-btn" class="hidden">OK</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // Injeta CSS dinâmico para animações e ocultação
    const style = document.createElement('style');
    style.textContent = `
        /* FIX: Faz o wrapper dinâmico se comportar corretamente no grid do desktop */
        @media (min-width: 768px) {
            #form-details-wrapper {
                display: contents;
            }
        }

        #form-details-wrapper.hidden { display: none; }
        .reveal-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            will-change: opacity, transform;
        }
        .reveal-on-scroll.is-visible {
            opacity: 1;
            transform: none;
        }
        /* Estilos do Popup */
        .complice-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
        }
        .complice-overlay.hidden { display: none; }
        .complice-popup-content {
            background: white; padding: 30px; border-radius: 10px;
            text-align: center; max-width: 90%; width: 350px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .complice-popup-content .icon { font-size: 40px; margin-bottom: 15px; }
        .complice-popup-content .message { font-size: 18px; color: #333; margin-bottom: 20px; }
        .complice-popup-content.sucesso .message { color: #28a745; font-weight: bold; }
        .complice-popup-content.erro .message { color: #dc3545; font-weight: bold; }
        .complice-popup-content.alerta .message { color: #ffc107; font-weight: bold; }
        
        .spinner {
            border: 4px solid #f3f3f3; border-top: 4px solid #8B0000;
            border-radius: 50%; width: 40px; height: 40px;
            animation: spin 1s linear infinite; margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        #popup-close-btn {
            background: #8B0000; color: white; border: none;
            padding: 10px 20px; border-radius: 5px; cursor: pointer;
            font-size: 16px; margin-top: 10px;
        }
        #popup-close-btn.hidden { display: none; }
    `;
    document.head.appendChild(style);

    // Evento para fechar popup
    document.getElementById('popup-close-btn').addEventListener('click', closePopup);
}

function mostrarPopup(texto, tipo) {
    const popup = document.getElementById('complice-popup');
    const popupContent = document.getElementById('complice-popup-content');
    const iconEl = popupContent.querySelector('.icon');
    const messageEl = popupContent.querySelector('.message');
    const closeBtn = document.getElementById('popup-close-btn');

    popupContent.className = 'complice-popup-content'; // Reseta classes
    messageEl.textContent = texto;
    iconEl.innerHTML = ''; 

    // Configura o visual baseado no tipo
    switch (tipo) {
        case 'success':
            popupContent.classList.add('sucesso');
            iconEl.textContent = '✅';
            closeBtn.classList.remove('hidden');
            break;
        case 'error':
            popupContent.classList.add('erro');
            iconEl.textContent = '❌';
            closeBtn.classList.remove('hidden');
            break;
        case 'warning':
            popupContent.classList.add('alerta');
            iconEl.textContent = '⚠️';
            closeBtn.classList.remove('hidden');
            break;
        case 'loading':
            popupContent.classList.add('alerta');
            iconEl.innerHTML = '<div class="spinner"></div>';
            closeBtn.classList.add('hidden'); // Esconde botão de fechar enquanto carrega
            break;
    }

    popup.classList.remove('hidden');
}

function closePopup() {
    document.getElementById('complice-popup').classList.add('hidden');
}

function habilitarSubmit(habilitar) {
    const submitBtn = document.getElementById('main-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = !habilitar;
        submitBtn.style.cursor = habilitar ? 'pointer' : 'not-allowed';
        submitBtn.style.opacity = habilitar ? '1' : '0.6';
    }
}

function revelarFormulario() {
    const formDetails = document.getElementById('form-details-wrapper');
    if (formDetails) {
        formDetails.classList.remove('hidden');
        
        // Configura o IntersectionObserver para animação de scroll
        if (formObserver) formObserver.disconnect();

        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        
        formObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Seleciona elementos dentro do wrapper para animar
        const elementsToReveal = formDetails.querySelectorAll('.form-group, .partner-group, .info-box, .signature-section, .section-header, .table-container');
        elementsToReveal.forEach(el => {
            el.classList.add('reveal-on-scroll');
            formObserver.observe(el);
        });
    }
}

// --- INICIALIZAÇÃO E EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {
    injectHtmlElements();
    preencherDataAtual();
    logVisitorInfo();

    // Listeners para Validação Inicial
    const cnpjCheckInput = document.getElementById('cnpjCheck');
    if (cnpjCheckInput) {
        cnpjCheckInput.addEventListener('input', cnpjMask);
        cnpjCheckInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkCNPJAccess();
            }
        });
    }
    document.getElementById('btnConsultarCNPJ')?.addEventListener('click', checkCNPJAccess);

    // Ativa a animação de revelação para os elementos do formulário
    revelarFormulario();

    // Listeners de Máscaras
    document.getElementById('cnpj').addEventListener('input', (e) => {
        cnpjMask(e);
    });
    // Adiciona o listener para consultar o CNPJ quando o usuário sai do campo
    document.getElementById('cnpj').addEventListener('blur', consultarDadosReceita);

    document.getElementById('whatsapp').addEventListener('input', phoneMask);
    document.getElementById('telefone1').addEventListener('input', phoneMask);
    document.getElementById('telefone2').addEventListener('input', phoneMask);
    document.getElementById('cep').addEventListener('input', cepMask);
    document.getElementById('cep').addEventListener('blur', searchCep);
    
    document.getElementById('cpfResponsavel').addEventListener('blur', consultarCPF);
    document.getElementById('cpfResponsavel').addEventListener('input', cpfMask);
    document.getElementById('cpfSocio2').addEventListener('input', cpfMask);
    document.getElementById('cpfSocio3').addEventListener('input', cpfMask);
    document.getElementById('cpfSocio4').addEventListener('input', cpfMask);

    document.getElementById('cnpjConta').addEventListener('input', cnpjMask);
    document.getElementById('codigoCliente').addEventListener('input', numericMask);
    document.getElementById('codigoBanco').addEventListener('input', numericMask);
    document.getElementById('agencia').addEventListener('input', numericMask);
    document.getElementById('contaDigito').addEventListener('input', accountMask);

    // Sincronização de campos
    const filialInput = document.getElementById('filial');
    const especialistaInput = document.getElementById('especialista');
    if (filialInput) filialInput.addEventListener('input', () => document.getElementById('filialAssinatura').value = filialInput.value);
    if (especialistaInput) especialistaInput.addEventListener('input', () => document.getElementById('especialistaAssinatura').value = especialistaInput.value);

    // Contador Pix
    const chavePixInput = document.getElementById('chavePix');
    const chavePixCounter = document.getElementById('chavePixCounter');
    if (chavePixInput) chavePixInput.addEventListener('input', () => chavePixCounter.textContent = `(${chavePixInput.value.length} caracteres)`);
});

// --- OUTRAS FUNÇÕES AUXILIARES (CEP, DATA, IP) ---

function preencherDataAtual() {
    const hoje = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const diaEl = document.getElementById('dia');
    const mesEl = document.getElementById('mes');
    const anoEl = document.getElementById('ano');

    if (diaEl) diaEl.value = hoje.getDate();
    if (mesEl) mesEl.value = meses[hoje.getMonth()];
    if (anoEl) anoEl.value = hoje.getFullYear();
}

async function searchCep() {
    const cepInput = document.getElementById('cep');
    let cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
            document.getElementById('logradouro').value = data.logradouro;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('uf').value = data.uf;
        }
    } catch (e) { console.error('Erro CEP', e); }
}

async function logVisitorInfo() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        document.getElementById('visitorIp').value = data.ip || '';
        document.getElementById('visitorLocation').value = `${data.city}, ${data.region}, ${data.country}`;
        document.getElementById('accessTime').value = new Date().toLocaleString();
    } catch (e) { console.error('Erro IP', e); }
}

// --- CONSULTA CNPJ VIA API ---

function checkCNPJAccess() {
    const cnpjInput = document.getElementById('cnpjCheck');
    const statusDiv = document.getElementById('cnpj-check-status');
    const restrictedContent = document.getElementById('restricted-content');
    const cnpjValue = cnpjInput.value;
    const cleanedCnpj = cnpjValue.replace(/\D/g, '');

    if (cleanedCnpj.length !== 14) {
        statusDiv.textContent = 'CNPJ incompleto.';
        statusDiv.style.color = 'red';
        return;
    }

    statusDiv.textContent = 'Consultando dados...';
    statusDiv.style.color = '#777';

    fetch("http://192.168.0.15:5000/consultar-cnpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj: cnpjValue })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'APROVADO') {
            statusDiv.textContent = '✅ Acesso Aprovado!';
            statusDiv.style.color = 'green';
            
            // Libera o formulário e preenche o segundo campo
            restrictedContent.classList.remove('hidden');
            const mainCnpj = document.getElementById('cnpj');
            if (mainCnpj) {
                mainCnpj.value = cnpjValue;
                mainCnpj.dispatchEvent(new Event('blur')); // Dispara validação do campo original se houver
            }
            revelarFormulario(); // Reinicia observadores de animação
        } else {
            statusDiv.textContent = '⛔ Acesso Negado: ' + (data.status === 'not_found' ? 'CNPJ não encontrado' : data.status);
            statusDiv.style.color = 'red';
            restrictedContent.classList.add('hidden');
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        statusDiv.textContent = '❌ Erro de conexão.';
        statusDiv.style.color = 'red';
    });
}

async function consultarDadosReceita(event) {
    const cnpjInput = event.target;
    const cnpjStatusDiv = document.getElementById('cnpj-status');
    const cnpjValue = cnpjInput.value.replace(/\D/g, '');
    
    if (cnpjValue.length !== 14) {
        if (cnpjStatusDiv) cnpjStatusDiv.textContent = '';
        return;
    }

    if (cnpjStatusDiv) {
        cnpjStatusDiv.textContent = '🔍 Buscando dados na Receita...';
        cnpjStatusDiv.style.color = '#777';
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjValue}`);
        if (!response.ok) throw new Error('Erro na API');
        const data = await response.json();

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('razaoSocial', data.razao_social);
        setVal('nomeFantasia', data.nome_fantasia || data.razao_social);
        
        if (data.cep) {
            setVal('cep', data.cep.replace(/^(\d{5})(\d{3})/, '$1-$2'));
            setVal('logradouro', data.logradouro);
            setVal('numero', data.numero);
            setVal('complemento', data.complemento);
            setVal('bairro', data.bairro);
            setVal('cidade', data.municipio);
            setVal('uf', data.uf);
        }

        setVal('email', data.email);
        
        if (data.ddd_telefone_1) {
            let tel = data.ddd_telefone_1;
            if (tel.length >= 10) {
                tel = tel.replace(/\D/g, '');
                tel = tel.replace(/^(\d{2})(\d)/g, '($1) $2');
                tel = tel.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            setVal('telefone1', tel);
        }

        if (cnpjStatusDiv) {
            cnpjStatusDiv.textContent = '';
            cnpjStatusDiv.style.color = 'green';
        }
    } catch (e) {
        console.error(e);
        if (cnpjStatusDiv) {
            cnpjStatusDiv.textContent = '⚠️ Dados não encontrados automaticamente.';
            cnpjStatusDiv.style.color = '#e67e22';
        }
    }
}

async function consultarCPF(event) {
    const cpfInput = event.target;
    const nomeInput = document.getElementById('responsavelLegal');
    const cpfValue = cpfInput.value.replace(/\D/g, '');

    if (cpfValue.length !== 11) return;
    
    // Feedback visual
    nomeInput.placeholder = "Consultando Receita...";

    try {
        // OBS: A Receita Federal não possui API pública gratuita para CPF (como a BrasilAPI).
        // É necessário contratar um serviço (Serpro, Infosimples, etc) e colocar a URL aqui.
        
        // Exemplo de estrutura para chamada externa:
        // const response = await fetch(`https://api.seuservico.com.br/cpf/${cpfValue}`, {
        //     headers: { "Authorization": "Bearer SEU_TOKEN" }
        // });
        // const data = await response.json();
        // if (data.nome) nomeInput.value = data.nome;
        
        console.log("Configure a API de CPF no script.js (Função consultarCPF)");
    } catch (e) {
        console.error("Erro na consulta de CPF:", e);
    } finally {
        nomeInput.placeholder = "";
    }
}

// --- ENVIO DO FORMULÁRIO ---

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

document.getElementById('docForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;

    try {
        // Validações do lado do cliente
        if (signaturePadSubadquirente.isEmpty() || signaturePadEstabelecimento.isEmpty()) {
            throw new Error('As assinaturas do Subadquirente e do Estabelecimento são obrigatórias.');
        }
        if (!document.getElementById('compBancario')?.files[0]) {
            throw new Error('O anexo do Comprovante Bancário é obrigatório.');
        }

        mostrarPopup('Enviando formulário...', 'loading');

        // 1. Coletar dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const segmentos = formData.getAll('segmento').join(', ');

        // 2. Construir Corpo do E-mail (HTML)
        let htmlBody = `
            <h2>Novo Credenciamento - PERmite</h2>
            <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                <tr style="background-color: #8B0000; color: white;"><th colspan="2" style="padding: 10px;">Dados do Cliente</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Razão Social:</td><td style="padding: 8px;">${data.razaoSocial || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Nome Fantasia:</td><td style="padding: 8px;">${data.nomeFantasia || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">CNPJ:</td><td style="padding: 8px;">${data.cnpj || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Código do Cliente:</td><td style="padding: 8px;">${data.codigoCliente || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Especialista/Executivo:</td><td style="padding: 8px;">${data.especialista || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Filial:</td><td style="padding: 8px;">${data.filial || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Marca:</td><td style="padding: 8px;">${data.marca || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Qtde de POS:</td><td style="padding: 8px;">${data.qtdePos || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Segmento:</td><td style="padding: 8px;">${segmentos}</td></tr>
                
                <tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 10px;">Contato</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Principal Contato:</td><td style="padding: 8px;">${data.principalContato || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">E-mail:</td><td style="padding: 8px;">${data.email || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">WhatsApp:</td><td style="padding: 8px;">${data.whatsapp || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Quem Sugeriu:</td><td style="padding: 8px;">${data.quemSugeriu || ''}</td></tr>

                <tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 10px;">Endereço</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">CEP:</td><td style="padding: 8px;">${data.cep || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Logradouro:</td><td style="padding: 8px;">${data.logradouro || ''}, ${data.numero || ''} ${data.complemento || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Bairro:</td><td style="padding: 8px;">${data.bairro || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Cidade/UF:</td><td style="padding: 8px;">${data.cidade || ''} / ${data.uf || ''}</td></tr>

                <tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 10px;">Dados Bancários</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Banco:</td><td style="padding: 8px;">${data.nomeBanco || ''} (Cód: ${data.codigoBanco || ''})</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Agência:</td><td style="padding: 8px;">${data.agencia || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Conta:</td><td style="padding: 8px;">${data.contaDigito || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Chave PIX:</td><td style="padding: 8px;">${data.chavePix || ''} (${data.tipoChavePix || ''})</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Titular Conta:</td><td style="padding: 8px;">${data.razaoSocialConta || ''} (CNPJ: ${data.cnpjConta || ''})</td></tr>

                <tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 10px;">Condições Comerciais</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Antecipação Automática:</td><td style="padding: 8px;">${data.antecipacaoAutomatica || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Parcela Vendas:</td><td style="padding: 8px;">${data.parcelaVendas || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Custo por conta Estab.:</td><td style="padding: 8px;">${data.porContaEstabelecimento || ''}</td></tr>
                
                <tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 10px;">Outros</th></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Data de Envio:</td><td style="padding: 8px;">${data.dataRecebimento || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Tipo Credenciamento:</td><td style="padding: 8px;">${data.tipoCredenciamento || ''}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Responsável Legal:</td><td style="padding: 8px;">${data.responsavelLegal || ''} (CPF: ${data.cpfResponsavel || ''})</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">IP Visitante:</td><td style="padding: 8px;">${document.getElementById('visitorIp').value}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Localização:</td><td style="padding: 8px;">${document.getElementById('visitorLocation').value}</td></tr>
            </table>
        `;

        // 3. Preparar Anexos
        const attachments = [];

        // Comprovante Bancário
        const fileInput = document.getElementById('compBancario');
        if (fileInput.files[0]) {
            const base64File = await fileToBase64(fileInput.files[0]);
            attachments.push({
                "@odata.type": "#microsoft.graph.fileAttachment",
                "name": fileInput.files[0].name,
                "contentBytes": base64File
            });
        }

        // Assinaturas
        const sigSub = signaturePadSubadquirente.toDataURL().split(',')[1];
        attachments.push({
            "@odata.type": "#microsoft.graph.fileAttachment",
            "name": "assinatura_subadquirente.png",
            "contentBytes": sigSub
        });

        const sigEstab = signaturePadEstabelecimento.toDataURL().split(',')[1];
        attachments.push({
            "@odata.type": "#microsoft.graph.fileAttachment",
            "name": "assinatura_estabelecimento.png",
            "contentBytes": sigEstab
        });

        // 4. Enviar E-mail
        const emailData = {
            subject: "Novo - Credenciamento",
            body: htmlBody,
            to: "docpermite@per.com.br",
            attachments: attachments
        };

        await sendEmail(emailData);

        closePopup(); // Fecha o popup de "loading"
        mostrarPopup('Formulário enviado com sucesso!', 'success');

        // Limpa o formulário e os campos
        form.reset();
        signaturePadSubadquirente.clear();
        signaturePadEstabelecimento.clear();

        // Limpa o nome do arquivo exibido
        const fileNameDiv = document.getElementById('compBancario').parentElement.querySelector('.file-name');
        if (fileNameDiv) {
            fileNameDiv.textContent = '';
        }
        preencherDataAtual(); // Preenche a data novamente após o reset

    } catch (error) {
        closePopup(); // Garante que o popup de loading feche em caso de erro
        mostrarPopup(error.message || 'Ocorreu um erro. Verifique os campos.', 'error');
    }
});
