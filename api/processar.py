from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Lê os dados enviados pelo seu front-end (JavaScript)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(body)
            nome = data.get('nome', 'Visitante')
            resposta = {"mensagem": f"Olá, {nome}! O Python na Vercel processou isso com sucesso."}
        except Exception as e:
            resposta = {"erro": str(e)}

        # Retorna a resposta em JSON para o front-end
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(resposta).encode('utf-8'))

    def do_GET(self):
        # Caso alguém acesse a rota diretamente pelo navegador via GET
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "API Python rodando na Vercel!"}).encode('utf-8'))
