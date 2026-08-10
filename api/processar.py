from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Configuração da API do Google (Certifique-se de configurar sua chave de ambiente ou usar de forma segura)
GEMINI_API_KEY = os.getenv("AQ.Ab8RN6J8AtZMZbsWIOpW5m0i_OxZEgVX7Ov7zJ8CUurRUBGYQg")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def call_gemini_api(prompt):
    if not GEMINI_API_KEY:
        return {"error": "API Key não configurada"}
    
    headers = {'Content-Type': 'application/json'}
    params = {'key': GEMINI_API_KEY}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(GEMINI_URL, headers=headers, params=params, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

@app.route('/contextualize', methods=['POST'])
def contextualize_bubbles():
    data = request.json
    bubbles = data.get('bubbles', []) # Lista de bolinhas com {id, text, area}
    
    # Prepara o prompt para a IA entender e conectar
    prompt = "Analise as seguintes ideias e identifique quais possuem relações temáticas. Retorne apenas um JSON no formato {'connections': [{'from': id1, 'to': id2}, ...]} baseando-se no contexto:\n"
    for b in bubbles:
        prompt += f"ID: {b['id']}, Texto: {b['text']}, Área: {b['area']}\n"
        
    result = call_gemini_api(prompt)
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
