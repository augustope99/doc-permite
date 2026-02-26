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

    // --- LÓGICA DE OCULTAÇÃO INICIAL ---
    // Encontra o CNPJ e agrupa tudo que vem depois dele
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        const formGroup = cnpjInput.closest('.form-group');
        if (formGroup && formGroup.parentElement) {
            const wrapper = document.createElement('div');
            wrapper.id = 'form-details-wrapper';

            const parent = formGroup.parentElement; // .form-grid
            let nextSibling = formGroup.nextElementSibling;
            const elementsToMove = [];

            // Coleta todos os irmãos seguintes ao grupo do CNPJ
            while (nextSibling) {
                elementsToMove.push(nextSibling);
                nextSibling = nextSibling.nextElementSibling;
            }

            // Move para dentro do wrapper
            elementsToMove.forEach(el => wrapper.appendChild(el));
            parent.appendChild(wrapper);
        }
    }

    // Ativa a animação de revelação para os elementos do formulário
    revelarFormulario();

    // Listeners de Máscaras
    document.getElementById('cnpj').addEventListener('input', (e) => {
        cnpjMask(e);
    });
    document.getElementById('whatsapp').addEventListener('input', phoneMask);
    document.getElementById('telefone1').addEventListener('input', phoneMask);
    document.getElementById('telefone2').addEventListener('input', phoneMask);
    document.getElementById('cep').addEventListener('input', cepMask);
    document.getElementById('cep').addEventListener('blur', searchCep);
    
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

        // Simula o tempo de envio, já que a lógica de e-mail foi removida.
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Como o envio de e-mail foi removido, apenas simulamos o sucesso.
        closePopup(); // Fecha o popup de "loading"
        mostrarPopup('Formulário enviado com sucesso! (Esta é uma simulação)', 'success');

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
