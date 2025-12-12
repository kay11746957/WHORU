# WHORU - 反詐騙辨識應用程式

<div align="center">
  <img src="assets/icon.png" alt="WHORU Logo" width="120"/>
  
  **使用 AI 技術幫助您識別詐騙影片，保護自己免受詐騙侵害**
  
  [![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat&logo=expo)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
</div>

---

## 📱 專案簡介

WHORU 是一個反詐騙應用程式，結合 AI 深度學習技術（Xception 模型）來檢測影片是否為深度偽造（Deepfake）。應用程式還提供反詐騙知識庫，幫助用戶提高防詐騙意識。

### 主要功能

✅ **影片檢測** - 上傳影片進行 AI 深度偽造檢測  
✅ **檢測紀錄** - 查看歷史檢測結果  
✅ **反詐騙知識** - 瀏覽最新的反詐騙資訊  
✅ **會員系統** - 完整的註冊、登入、密碼管理功能  
✅ **螢幕錄製** - 錄製螢幕操作（需 Development Build）

---

## 🛠️ 技術棧

### 前端
- **React Native** - 跨平台移動應用框架
- **Expo SDK 54** - 開發工具和服務
- **React Navigation** - 路由和導航
- **React Native Paper** - UI 組件庫
- **Axios** - HTTP 請求

### 後端
- **Node.js** - 運行環境
- **Express** - Web 框架
- **MySQL** - 關係型資料庫
- **Multer** - 文件上傳處理
- **Bcrypt** - 密碼加密
- **Nodemailer** - 郵件發送

### AI 檢測
- **Python 3.9+** - AI 腳本運行環境
- **TensorFlow/Keras** - 深度學習框架
- **Xception 模型** - 影片深度偽造檢測
- **OpenCV** - 影像處理
- **face_recognition** - 人臉檢測

---

## 📦 安裝指南

### 環境需求

- Node.js 16+
- Python 3.9+
- MySQL 8.0+
- Expo Go App（iOS/Android）或 Development Build

### 1. 克隆專案

```bash
git clone https://github.com/kay11746957/WHORU.git
cd WHORU
```

### 2. 前端設置

```bash
# 安裝依賴
npm install

# 複製環境變數範例（稍後設置）
cp .env.example .env
```

### 3. 後端設置

```bash
cd backend

# 安裝 Node.js 依賴
npm install

# 複製環境變數範例
cp .env.example .env
```

### 4. 資料庫設置

```sql
-- 創建資料庫
CREATE DATABASE test01;
USE test01;

-- 創建用戶表
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  birthday DATE NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME
);

-- 創建影片檢測表
CREATE TABLE checkvideo (
  C_VideoId INT PRIMARY KEY AUTO_INCREMENT,
  C_UserId INT NOT NULL,
  C_VideoPath VARCHAR(500) NOT NULL,
  C_Result VARCHAR(100),
  C_UpTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (C_UserId) REFERENCES user(id)
);

-- 創建知識庫表
CREATE TABLE knowledge (
  K_Id INT PRIMARY KEY AUTO_INCREMENT,
  K_Update_Time DATETIME(6) NOT NULL,
  K_Content VARCHAR(5000) NOT NULL,
  K_Source VARCHAR(200) NOT NULL,
  K_ImageURL VARCHAR(500) DEFAULT NULL
);
```

### 5. Python 環境設置

```bash
# 建議使用 Conda 環境
conda create -n whoru python=3.9
conda activate whoru

# 安裝 Python 依賴
pip install tensorflow opencv-python face-recognition numpy
```

---

## ⚙️ 配置

### 前端配置 (`config.js`)

```javascript
// 更新為您的 ngrok URL 或伺服器地址
const API_BASE_URL = 'https://your-ngrok-url.ngrok-free.app';
```

### 後端配置 (`.env`)

創建 `backend/.env` 文件：

```env
# 資料庫配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=test01
DB_PORT=3306

# 伺服器配置
PORT=3000

# Email 配置（用於密碼重設）
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# API URL（Ngrok）
API_BASE_URL=https://your-ngrok-url.ngrok-free.app

# Python 路徑
PYTHON_PATH=C:/Users/YourUser/anaconda3/python.exe

# 模型路徑
MODEL_PATH=C:/path/to/Xception_model_canny_crop.h5
```

---

## 🚀 運行專案

### 啟動後端

```bash
cd backend
node server.js
```

輸出應該顯示：
```
Server is running on port 3000
Connected to the database.
```

### 啟動 Ngrok

```bash
npx ngrok http 3000
```

複製 ngrok URL 並更新：
- `config.js` 中的 `API_BASE_URL`
- `backend/config.js` 中的 `API_BASE_URL`

### 啟動前端

```bash
# 回到專案根目錄
cd ..

# 啟動 Expo
npx expo start
```

### 在手機上測試

1. 下載 Expo Go App
2. 掃描 QR Code
3. 開始使用應用程式！

---

## 📖 API 端點

### 用戶相關
- `POST /register` - 註冊新用戶
- `POST /login` - 用戶登入
- `POST /forgot` - 忘記密碼
- `POST /edit-password` - 變更密碼

### 影片檢測
- `POST /upload` - 上傳影片進行檢測
- `GET /video-result/:videoId` - 查詢檢測結果
- `GET /api/videos/user` - 獲取用戶的檢測紀錄

### 知識庫
- `GET /knowledge` - 獲取反詐騙知識列表

---

## 📁 專案結構

```
WHORU/
├── assets/              # 圖片資源
├── backend/            # 後端代碼
│   ├── server.js       # Express 伺服器
│   ├── use.py          # AI 檢測腳本
│   ├── config.js       # 後端配置
│   └── uploads/        # 上傳的影片（不包含在 Git）
├── App.js              # 主應用入口
├── Login.js            # 登入頁面
├── Register.js         # 註冊頁面
├── Detection.js        # 影片檢測
├── LocalVideos.js      # 檢測紀錄
├── Tips.js             # 反詐騙知識
├── config.js           # 前端 API 配置
├── package.json        # 前端依賴
└── README.md           # 本文件
```

---

## 🔐 安全性建議

1. **設置強密碼** - MySQL root 用戶應使用強密碼
2. **保護 .env** - 不要將 `.env` 文件提交到 Git
3. **使用 HTTPS** - 生產環境使用 HTTPS 而非 HTTP
4. **定期更新依賴** - 運行 `npm audit fix` 修復安全漏洞
5. **限制 API 訪問** - 添加速率限制和身份驗證

---

## 🐛 常見問題

### Q: Expo Go 中螢幕錄製功能無法使用？
A: 螢幕錄製需要原生模組，無法在 Expo Go 中運行。需要創建 Development Build：
```bash
npx eas build --profile development --platform android
```

### Q: 圖片無法顯示？
A: 確保：
1. 資料庫中 `K_ImageURL` 欄位包含有效的圖片 URL
2. Ngrok URL 正確配置
3. 圖片 URL 可公開訪問

### Q: 推送到 GitHub 失敗？
A: 如果遇到大文件問題：
1. 確保 `.gitignore` 正確排除大文件
2. 使用 Git LFS 處理大文件
3. 或創建全新的 Git 倉庫（如本專案）

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📄 授權條款

本專案採用 MIT License - 詳見 [LICENSE](LICENSE) 文件

---

## 👥 作者

- **Kay** - *開發者* - [GitHub](https://github.com/kay11746957)

---

## 🙏 致謝

- Expo 團隊提供優秀的開發工具
- 反詐騙 165 全民防騙網提供知識資源
- 所有使用和貢獻本專案的人

---

<div align="center">
  
**⭐ 如果這個專案對您有幫助，請給一個星星！⭐**

Made with ❤️ in Taiwan

</div>
