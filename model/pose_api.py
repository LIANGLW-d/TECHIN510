from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'model/pose_classifier.pkl'
LABEL_MAP = {
    'good': 'Deadlift: Correct',
    'wideleg': 'Deadlift: Legs Too Wide',
    'shoulderpress': 'Shoulder Press: Correct',
    'shoulderpress_bad1': 'Shoulder Press: Incorrect Form',
    'flyes': 'Flyes: Correct',
    'flyes_bad': 'Flyes: Incorrect Arm Position'
}

clf = joblib.load(MODEL_PATH)

@app.route('/classify', methods=['POST'])
def classify():
    data = request.json
    keypoints = np.array(data['keypoints']).reshape(1, -1)
    label = clf.predict(keypoints)[0]
    feedback = LABEL_MAP.get(label, f"类别: {label}")
    return jsonify({'result': feedback})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050) 