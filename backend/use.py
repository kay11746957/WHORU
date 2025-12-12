import numpy as np
import cv2
from tensorflow.keras.models import load_model
import argparse
import json
import face_recognition


# 定義圖像大小
image_size = (299, 299)
gamma = 1

def crop(img):
  #檢測人臉位置
  loc = face_recognition.face_locations(img)

  if loc:
      # 獲取第一張臉的位置
      y1, x2, y2, x1 = loc[0]

      # 裁剪圖像
      cropped_img = img[y1:y2, x1:x2]

      # 縮放裁剪後的圖像到 71x71
      resized_img = cv2.resize(cropped_img,image_size)
      return resized_img
  else:
      frame = cv2.resize(img, image_size)
      return frame

def image_negative(f):#傳入一張圖片，由255去扣掉傳入的圖片，回傳負值圖片
    g = 255 - f
    return g

def gamma_correction(image, gamma):
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(image, table)

def canny(img):
    edges = cv2.Canny(img, 150, 50)
    return edges

def extract_frames_from_video_real(video_path, frame_interval=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            if frame_count % frame_interval == 0:
                frame = crop(frame)
                # negative_image = image_negative(frame)
                # negative_image = cv2.cvtColor(negative_image, cv2.COLOR_BGR2GRAY)
                # negative_image = np.expand_dims(negative_image, axis=-1)
                # frames.append(negative_image)
                # gamma_image = gamma_correction(frame, gamma)
                # gamma_image = cv2.cvtColor(gamma_image, cv2.COLOR_BGR2RGB)
                # frames.append(gamma_image)
                canny_img = canny(frame)
                canny_img = np.expand_dims(canny_img, axis=-1)
                canny_img = cv2.cvtColor(canny_img, cv2.COLOR_BGR2RGB)
                frames.append(canny_img)
                # frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                # cv2.imshow("g",frame)
                # cv2.waitKey(0)
                # cv2.destroyAllWindows()
                # frames.append(frame)
        frame_count += 1
    cap.release()
    return frames

# 對每一幀進行預測
def predict_frames(frames, model):
    predictions = []
    for frame in frames:
        frame = np.expand_dims(frame, axis=0)
        prediction = model.predict(frame,verbose=0)
        predictions.append(prediction[0][0])
    return predictions

# 分析圖片
def predict_pic(img,model):
    img = crop(img)
    img = canny(img)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = np.expand_dims(img, axis=0)
    prediction = model.predict(img,verbose=0)
    print(prediction[0][0])

# 分析視頻
def analyze_video(video_path, model, frame_interval=30):
    frames = extract_frames_from_video_real(video_path, frame_interval)
    predictions = predict_frames(frames, model)
    # print(predictions)
    r = 0
    f = 0
    for fake in predictions:
        if fake < 0.5:
            r += 1
        if fake >= 0.5:
            f += 1

    # 判斷結果並輸出中文
    if f >= 1:
        result = {"result": "此影片是偽造影片"}  # 當偽造影片概率大於等於 0.5 時
    else:
        result = {"result": "此影片是真實影片"}  # 當偽造影片概率小於 0.5 時

    print(json.dumps(result))
# 加載訓練好的Xception模型
Xception_model = load_model('C:/Users/user/anaconda3/envs/Xception/python/Xception_model_canny_crop.h5',compile=False)
# Xception_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])


if __name__ == '__main__':
    p = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument('--video_path', '-i', type=str)
    args = p.parse_args()

    video_path = args.video_path
    if video_path.endswith('.mp4') or video_path.endswith('.avi'):
        analyze_video(video_path, Xception_model)
    elif video_path.endswith('.jpg') or video_path.endswith('.png'):
        img = cv2.imread(video_path)
        predict_pic(img,Xception_model)
    else:
        print("wrong")