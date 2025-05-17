from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

latest_data = {}

@app.route('/sensor', methods=['POST', 'GET'])
def sensor():
    global latest_data
    if request.method == 'POST':
        latest_data = request.json
        return '', 200
    else:
        return jsonify(latest_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050) 