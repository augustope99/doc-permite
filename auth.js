// CONFIGURAÇÃO MICROSOFT GRAPH API
// IMPORTANTE: Substitua 'SEU_CLIENT_ID_AQUI' pelo Client ID do Azure AD
// Siga os passos no arquivo CONFIGURACAO_AZURE.md

const msalConfig = {
    auth: {
        clientId: '0a102342-3279-4cf1-bcf9-9bbf104a4434',
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: 'http://localhost:8080'
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ['Mail.Send']
};

let accessToken = null;

// Login no Outlook
async function loginOutlook() {
    try {
        const response = await msalInstance.loginPopup(loginRequest);
        accessToken = response.accessToken;
        return accessToken;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

// Enviar e-mail com anexos via Microsoft Graph
async function sendEmail(emailData) {
    if (!accessToken) {
        accessToken = await loginOutlook();
    }

    const message = {
        message: {
            subject: emailData.subject,
            body: {
                contentType: 'HTML',
                content: emailData.body
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: emailData.to
                    }
                }
            ],
            attachments: emailData.attachments
        }
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar e-mail');
    }

    return response;
}

// Converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}
