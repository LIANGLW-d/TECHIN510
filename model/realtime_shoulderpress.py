import cv2
import mediapipe as mp
import numpy as np
import joblib
from collections import deque

# ===== 参数设置 =====
MODEL_PATH = '/Users/stevenliang/Desktop/TECHIN510/motion-tracker/model/pose_classifier.pkl'
FRAME_WINDOW = 50  # 滑动窗口长度（50帧 ≈ 5秒）
LABEL_MAP = {
    'good': 'Deadlift: Correct',
    'wideleg': 'Deadlift: Legs Too Wide',
    'shoulderpress': 'Shoulder Press: Correct',
    'shoulderpress_bad1': 'Shoulder Press: Incorrect Form',
    'flyes': 'Flyes: Correct',
    'flyes_bad': 'Flyes: Incorrect Arm Position'
}

# ===== 加载模型 =====
try:
    clf = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Model loading failed: {e}")
    exit()

# ===== 初始化 =====
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# ===== 提取关键点函数 =====
def extract_pose_landmarks(results):
    if not results.pose_landmarks:
        return None
    landmarks = results.pose_landmarks.landmark
    return np.array([[l.x, l.y, l.z, l.visibility] for l in landmarks]).flatten()

# ===== 启动摄像头 =====
cap = cv2.VideoCapture(0)
pose_buffer = deque(maxlen=FRAME_WINDOW)

print("Camera started. Begin your movement. Press ESC to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        continue

    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image)

    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    keypoints = extract_pose_landmarks(results)
    if keypoints is not None:
        pose_buffer.append(keypoints)

        if len(pose_buffer) == FRAME_WINDOW:
            avg_feature = np.mean(pose_buffer, axis=0).reshape(1, -1)
            label = clf.predict(avg_feature)[0]
            feedback = LABEL_MAP.get(label, f"Unknown: {label}")
        else:
            feedback = "Collecting frames..."

        cv2.putText(image, feedback, (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0) if "Correct" in feedback else (0, 0, 255), 2)

    cv2.imshow('Pose Classifier', image)
    if cv2.waitKey(5) & 0xFF == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
