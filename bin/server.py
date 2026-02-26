import io
import re
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.user_credential import UserCredential

# ==============================================================================
# CONFIGURAÇÃO INICIAL
# ==============================================================================

app = Flask(__name__)
# Habilita o CORS para permitir que seu frontend acesse esta API
CORS(app)

# --- CONFIGURAÇÃO DO SHAREPOINT ---
SITE_URL = "https://maisper.sharepoint.com/sites/PERmite-OperaoIniciada"
FILE_PATH = "/sites/PERmite-OperaoIniciada/Documentos Compartilhados/Compliance (KYC)/FEIRA/ConsultaCNPJ.xlsx"

# IMPORTANTE: Por segurança, em produção, use variáveis de ambiente.
# Ex: USERNAME = os.getenv("SHAREPOINT_USER")
USERNAME = "USUARIO_TECNICO"
PASSWORD = "SENHA_TECNICA"

# Mapeamento de status para a resposta JSON, conforme especificado
STATUS_MAP = {
    "APROVADO": {"status": "APROVADO", "icon": "green"},
    "REPROVADO": {"status": "REPROVADO", "icon": "red"},
    "EM_ANALISE": {"status": "EM_ANALISE", "icon": "clock"},
    # Adicionei PENDENTE aqui, caso exista na sua planilha.
    # Se não existir, pode remover.
    "PENDENTE": {"status": "PENDENTE", "icon": "clock"},
}
NOT_FOUND_RESPONSE = {"status": "not_found", "icon": "question"}
ERROR_RESPONSE = {"status": "erro"}

# ==============================================================================
# FUNÇÕES AUXILIARES
# ==============================================================================

def limpar_cnpj(cnpj):
    """Remove caracteres não numéricos de uma string de CNPJ."""
    if not isinstance(cnpj, str):
        cnpj = str(cnpj)
    return re.sub(r'\D', '', cnpj)

# ==============================================================================
# ENDPOINT DA API
# ==============================================================================

@app.route('/consultar-cnpj', methods=['POST'])
def consultar_cnpj():
    """
    Endpoint que recebe um CNPJ, consulta uma planilha Excel no SharePoint
    e retorna o status correspondente.
    """
    try:
        data = request.get_json()
        if not data or 'cnpj' not in data:
            return jsonify({"error": "CNPJ não fornecido no corpo da requisição"}), 400

        cnpj_usuario = data['cnpj']
        cnpj_limpo_usuario = limpar_cnpj(cnpj_usuario)

        # --- ETAPA 1: Autenticar e baixar a planilha do SharePoint ---
        ctx = ClientContext(SITE_URL).with_credentials(UserCredential(USERNAME, PASSWORD))
        
        # Baixa o arquivo em memória
        file_response = ctx.web.get_file_by_server_relative_url(FILE_PATH).download().execute_query()
        
        if not file_response.content:
            raise ValueError("Não foi possível baixar o arquivo do SharePoint. Verifique o caminho e as permissões.")

        # --- ETAPA 2: Ler a planilha com Pandas ---
        # Usamos io.BytesIO para ler o conteúdo binário do arquivo em memória
        arquivo_excel = io.BytesIO(file_response.content)

        # Lê a planilha, especificando a aba e garantindo que a coluna CNPJ seja lida como texto
        df = pd.read_excel(
            arquivo_excel,
            sheet_name='ConsultaCNPJ', # Garanta que o nome da aba está correto
            dtype={'CNPJ': str, 'STATUS': str} # Força a leitura das colunas como texto
        )

        # --- ETAPA 3: Processar e buscar o CNPJ ---
        # Cria uma coluna temporária com os CNPJs limpos para uma comparação eficiente
        df['CNPJ_LIMPO'] = df['CNPJ'].apply(limpar_cnpj)

        # Busca pelo CNPJ limpo do usuário na coluna de CNPJs limpos do DataFrame
        resultado = df[df['CNPJ_LIMPO'] == cnpj_limpo_usuario]

        # --- ETAPA 4: Retornar o resultado ---
        if not resultado.empty:
            # Pega o status da primeira linha encontrada
            status_encontrado = resultado.iloc[0]['STATUS'].upper().strip()
            # Retorna a resposta mapeada ou a resposta de não encontrado como fallback
            return jsonify(STATUS_MAP.get(status_encontrado, NOT_FOUND_RESPONSE))
        else:
            return jsonify(NOT_FOUND_RESPONSE)

    except Exception as e:
        # Captura qualquer erro (autenticação, arquivo não encontrado, erro de leitura, etc.)
        print(f"Ocorreu um erro no servidor: {e}")
        return jsonify(ERROR_RESPONSE), 500

# ==============================================================================
# EXECUÇÃO DO SERVIDOR
# ==============================================================================

if __name__ == '__main__':
    # Executa o servidor na porta 5000, acessível na sua rede local
    app.run(host='0.0.0.0', port=5000, debug=True)