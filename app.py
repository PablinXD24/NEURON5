import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import json

app = Flask(__name__)
CORS(app)  # Permite que o seu index.html faça requisições para este servidor

# Inicializa o cliente do Gemini (Certifique-se de configurar GEMINI_API_KEY nas variáveis de ambiente do Render)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# As 5 Áreas da Vida padrão do sistema
LIFE_AREAS = [
    "Saúde & Bem-Estar",
    "Carreira & Trabalho",
    "Relacionamentos & Social",
    "Finanças & Crescimento Material",
    "Desenvolvimento Pessoal & Conhecimento"
]

@app.route("/api/process-node", methods=["POST"])
def process_node():
    data = request.json
    node_text = data.get("text", "")
    existing_nodes = data.get("existingNodes", []) # Lista de {id, text, area} já criadas

    # Monta o prompt para o Gemini analisar o contexto, classificar e conectar
    prompt = f"""
    Você é a IA central do sistema NEURON de mapeamento de pensamentos.
    Analise o seguinte pensamento/bolinha criada pelo usuário: "{node_text}"

    As 5 áreas da vida disponíveis são estritamente:
    1. Saúde & Bem-Estar
    2. Carreira & Trabalho
    3. Relacionamentos & Social
    4. Finanças & Crescimento Material
    5. Desenvolvimento Pessoal & Conhecimento

    Aqui estão as bolinhas já existentes no mapa do usuário (para contexto de conexões):
    {existing_nodes}

    Sua tarefa é retornar um JSON puro (sem markdown em volta, apenas o objeto JSON) com:
    - "area": Uma string exata contendo a área da vida escolhida dentre as 5 listadas.
    - "summary": Um resumo curto de 3 a 5 palavras da essência da bolinha.
    - "connections": Uma lista com os IDs (ids) das bolinhas existentes que possuem assunto interconectado com esta nova bolinha. Se nenhuma se conectar, retorne uma lista vazia.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )
        
        result = json.loads(response.text)
        return jsonify(result)
    except Exception as e:
        # Tratamento corrigido para usar str(e) e evitar novas quebras 500
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
