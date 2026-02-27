import io
import re
import pandas as pd
import requests
import msal
from flask import Flask, request, jsonify
from flask_cors import CORS

# ==============================================================================
# CONFIGURAÇÃO INICIAL
# ==============================================================================

app = Flask(__name__)
CORS(app)

# --- CONFIGURAÇÃO DO SHAREPOINT (GRAPH) ---

SITE_ID = "maisper.sharepoint.com,5c03e269-5715-4f03-9ce4-3b38ecde662c,7b666dd9-e2b5-426a-a5ec-e79a828d1298"

# Documentos Compartilhados
DRIVE_ID = "b!aeIDXBVXA0-c5Ds47N5mLNltZnu14mpCpeznmoKNEpjYBIMMA6_pRac-R0UO8E3L"

FILE_PATH_GRAPH = "/Compliance (KYC)/FEIRA/CNPJ-ANALISADOS.xlsx"

# --- CREDENCIAIS AZURE APP ---

CLIENT_ID = "89b07234-1e08-43e6-82f7-7b03d6dce6c0"
CLIENT_SECRET = "Bkh8Q~G3juNpUjiMGg8N93VaKmA1OADYRPzXOagG"
TENANT_ID = "1fb2191f-c87b-46f6-993f-36116dcce77b"

# ==============================================================================
# MAPEAMENTO DE STATUS
# ==============================================================================

STATUS_MAP = {
    "APROVADO": {"status": "APROVADO", "icon": "green"},
    "REPROVADO": {"status": "REPROVADO", "icon": "red"},
    "EM_ANALISE": {"status": "EM_ANALISE", "icon": "clock"},
    "PENDENTE": {"status": "PENDENTE", "icon": "clock"},
}

NOT_FOUND_RESPONSE = {"status": "not_found", "icon": "question"}
ERROR_RESPONSE = {"status": "erro"}

# ==============================================================================
# FUNÇÕES AUXILIARES
# ==============================================================================

def limpar_cnpj(cnpj):
    if not isinstance(cnpj, str):
        cnpj = str(cnpj)
    return re.sub(r'\D', '', cnpj)


def obter_token():
    """
    Obtém token Microsoft Graph
    """

    authority = f"https://login.microsoftonline.com/{TENANT_ID}"

    app_auth = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=authority,
        client_credential=CLIENT_SECRET
    )

    token = app_auth.acquire_token_for_client(
        scopes=["https://graph.microsoft.com/.default"]
    )

    if "access_token" not in token:
        raise Exception(token)

    return token["access_token"]


def baixar_excel():
    """
    Baixa Excel via Microsoft Graph
    """

    access_token = obter_token()

    url = f"https://graph.microsoft.com/v1.0/sites/{SITE_ID}/drives/{DRIVE_ID}/root:{FILE_PATH_GRAPH}:/content"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(response.text)

    return io.BytesIO(response.content)


# ==============================================================================
# ENDPOINT API
# ==============================================================================

@app.route('/consultar-cnpj', methods=['POST'])
def consultar_cnpj():

    try:

        data = request.get_json()

        if not data or 'cnpj' not in data:
            return jsonify({"error": "CNPJ não fornecido"}), 400

        cnpj_usuario = data['cnpj']
        cnpj_limpo_usuario = limpar_cnpj(cnpj_usuario)

        # 1 - BAIXAR PLANILHA

        excel_buffer = baixar_excel()

        # 2 - LER EXCEL

        df = pd.read_excel(
            excel_buffer,
            sheet_name='ConsultaCNPJ',
            dtype=str
        )

        # Normalizar colunas

        df.columns = [c.upper().strip() for c in df.columns]

        if 'CNPJ' not in df.columns or 'STATUS' not in df.columns:
            raise Exception("Planilha precisa ter colunas CNPJ e STATUS")

        # Limpar CNPJ planilha

        df['CNPJ_LIMPO'] = df['CNPJ'].apply(limpar_cnpj)

        # 3 - BUSCAR

        resultado = df[df['CNPJ_LIMPO'] == cnpj_limpo_usuario]

        # 4 - RETORNAR

        if not resultado.empty:

            status_encontrado = resultado.iloc[0]['STATUS'].upper().strip()

            return jsonify(
                STATUS_MAP.get(status_encontrado, NOT_FOUND_RESPONSE)
            )

        else:

            return jsonify(NOT_FOUND_RESPONSE)

    except Exception as e:

        print("ERRO SERVIDOR:")
        print(e)

        return jsonify(ERROR_RESPONSE), 500


# ==============================================================================
# EXECUÇÃO
# ==============================================================================

if __name__ == '__main__':

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )