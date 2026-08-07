import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Inicializa o cliente Gemini com a API Key do ambiente
# Certifique-se de definir a variável de ambiente: export GEMINI_API_KEY="sua_chave"
client = genai.Client()


@app.route("/api/analyze", methods=["POST"])
def analyze_bubble():
  try:
    data = request.json
    text = data.get("text", "")

    if not text:
      return jsonify(
          {"dominantId": "mind", "scores": {str(i): 0 for i in range(5)}}
      )

    prompt = f"""
        Analise o seguinte pensamento/ideia de um usuário: "{text}"
        Classifique a qual destas 5 áreas da vida ele pertence mais e calcule um score de relevância de 0 a 5 para cada uma das áreas:
        - health (Saúde & Físico)
        - mind (Mente & Intelecto)
        - social (Relacionamentos)
        - career (Carreira & Finanças)
        - spirit (Espiritual & Emocional)

        Responda ESTRITAMENTE em formato JSON puro, sem markdown, contendo:
        {{
          "dominantId": "id_da_area",
          "scores": {{
            "health": 0-5,
            "mind": 0-5,
            "social": 0-5,
            "career": 0-5,
            "spirit": 0-5
          }}
        }}
        """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    import json

    result_json = json.loads(response.text)
    return jsonify(result_json)

  except Exception as e:
    return jsonify({"error": str(e)}), 500


@app.route("/api/query", methods=["POST"])
def query_ai():
  try:
    data = request.json
    query = data.get("query", "")
    user_ideas = data.get("ideas", [])

    ideas_formatted = "\n".join(
        [
            f"[{i.get('area', 'Geral')}]: {i.get('text', '')}"
            for i in user_ideas
        ]
    )

    prompt = f"""
        Você é o assistente inteligente do sistema de mapeamento neural do usuário.
        Contexto das ideias/bolinhas salvas pelo usuário:
        {ideas_formatted}

        Com base nestas informações do usuário e no input dele: "{query}", responda de forma coesa, prestando consultoria, tirando dúvidas sobre as próprias anotações dele ou exercendo funções gerais de IA. Seja direto e prestativo.
        """

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=prompt
    )

    return jsonify({"response": response.text})

  except Exception as e:
    return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)
