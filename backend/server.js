const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const exec = require('child_process').exec;
const config = require('./config');
const app = express();
// 使用CORS
app.use(cors());

// 設定body-parser中間件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test01',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 確保目錄存在
const ensureUploadsDirExists = () => {
  const dir = 'uploads';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
ensureUploadsDirExists();

//配置email發送器
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kay11746957@gmail.com',
    pass: 'smng whot nktm tzxc',
  },
}, (error, info) => {
  if (error) {
    console.error('Transporter creation error:', error);
  } else {
    console.log('Transporter created successfully:', info);
  }
});


const crypto = require('crypto');

// Generate a reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
// 重設密碼
app.post('/forgot', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const sql = 'SELECT * FROM user WHERE U_Mail = ?';
  connection.query(sql, [email], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '此 email 尚未註冊' });
    }

    const resetToken = generateResetToken();
    const tokenExpiry = new Date(Date.now() + 25 * 3600000).toISOString().slice(0, 19).replace('T', ' '); // 1 hour from now

    // Save token and expiry to the database
    const updateSql = 'UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE U_Mail = ?';
    connection.query(updateSql, [resetToken, tokenExpiry, email], (updateError) => {
      if (updateError) {
        console.error('Error updating database with reset token:', updateError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const resetLink = `${config.RESET_PASSWORD_URL}?token=${resetToken}`;

      const mailOptions = {
        from: 'kay11746957@gmail.com',
        to: email,
        subject: 'WHORU會員重設密碼',
        text: `點擊此連結進入重設密碼頁面: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (mailError, info) => {
        if (mailError) {
          console.error('Error sending email:', mailError);
          return res.status(500).json({ error: 'Failed to send email' });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ message: '已成功寄出認證信!' });
      });
    });
  });
});

app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Missing token or password' });
  }

  const sql = 'SELECT * FROM user WHERE reset_token = ? AND reset_token_expiry > NOW()';
  connection.query(sql, [token], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const user = results[0];
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const updateSql = 'UPDATE user SET U_Password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE U_Id = ?';
      connection.query(updateSql, [hash, user.U_Id], (updateError) => {
        if (updateError) {
          console.error('Error updating password:', updateError);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json({ message: 'Password reset successfully' });
      });
    });
  });
});

app.get('/reset-password', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Missing token');
  }

  // 簡單的 HTML 表單來重設密碼
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <title>重設密碼</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .form-control:focus {
          box-shadow: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="text-center">重設密碼</h2>
        <form id="resetPasswordForm" onsubmit="return validatePasswords(event)">
          <input type="hidden" name="token" value="${token}" />
          <div class="mb-3">
            <label for="password" class="form-label">新密碼:</label>
            <input type="password" id="password" name="password" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">確認新密碼:</label>
            <input type="password" id="confirmPassword" class="form-control" required />
          </div>
          <div class="text-center">
            <button type="submit" class="btn btn-primary">重設密碼</button>
          </div>
        </form>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        function validatePasswords(event) {
          event.preventDefault();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          if (password !== confirmPassword) {
            alert('密碼不相符');
            return false;
          }

          const token = document.querySelector('input[name="token"]').value;

          fetch('/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, token }),
          })
          .then(response => response.json())
          .then(data => {
            alert(data.message || '密碼重設成功');
            window.close(); // 關閉當前頁面
          })
          .catch(error => {
            console.error('Error:', error);
            alert('發生錯誤，請稍後再試。');
          });

          return false;
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/reset-password', async (req, res) => {
  const { password, token } = req.body;

  // 在這裡驗證和處理密碼重設邏輯，例如驗證 token、更新密碼等。
  // 假設密碼重設成功，返回 JSON 響應。

  res.json({ message: '密碼重設成功' });
});

// 變更密碼
app.post('/edit-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: '缺少必要參數' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM user WHERE U_Id = ?';
      connection.query(sql, [userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results[0]);
      });
    });

    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await new Promise((resolve, reject) => {
      const sql = 'UPDATE user SET U_Password = ? WHERE U_Id = ?';
      connection.query(sql, [hashedPassword, userId], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    res.json({ message: '密碼已更新' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 處理註冊請求
app.post('/register', (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, name, email, birthday } = req.body;

  // 檢查必填字段是否存在
  if (!username || !password || !name || !email || !birthday) {
    console.error('Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 檢查電子郵件是否已經存在
  const checkEmailSql = 'SELECT * FROM user WHERE U_Mail = ?';
  connection.query(checkEmailSql, [email], (checkEmailError, checkEmailResults) => {
    if (checkEmailError) {
      console.error('Error checking email:', checkEmailError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (checkEmailResults.length > 0) {
      return res.status(400).json({ error: 'Email 已被註冊' });
    }

    // 將密碼進行hash處理
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password: ', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // 執行SQL INSERT
      const sql = 'INSERT INTO user (U_Account, U_Password, U_Name, U_Mail, U_Birthday) VALUES (?, ?, ?, ?, ?)';
      connection.query(sql, [username, hash, name, email, birthday], (error, results, fields) => {
        if (error) {
          console.error('Error registering user: ', error);
          console.error('SQL: ', sql);
          console.error('Parameters: ', [username, hash, name, email, birthday]);
          return res.status(500).json({ error: 'Registration failed' });
        }
        console.log('User registered successfully:', results);
        res.status(200).json({ message: 'Registration successful' });
      });
    });
  });
});


// 處理登入請求
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM user WHERE U_Account = ?', [username], (error, results, fields) => {
    if (error) {
      console.log('Error querying database: ', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const user = results[0];
    bcrypt.compare(password, user.U_Password, (err, result) => {
      if (err) {
        console.log('Error comparing passwords: ', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if (!result) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.U_Id,
          username: user.U_Account,
          name: user.U_Name,
          email: user.U_Mail,
          birthday: user.U_Birthday
        }
      });
    });
  });
});


// 上傳影片並處理檢測
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const videoPath = path.join(__dirname, 'uploads', req.file.filename);
  const { userId } = req.body;

  exec(`C:/Users/user/anaconda3/envs/Xception/python.exe C:/xampp/htdocs/AwesomeProject_0821/backend/use.py -i "${videoPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Internal server error' });
    }

    let result;
    try {
      result = JSON.parse(stdout.trim()); // 解析JSON格式的輸出
    } catch (e) {
      console.error('Error parsing Python script output:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // 將結果保存到資料庫
    const sql = 'INSERT INTO checkvideo (U_Id, C_UpTime, C_Time, C_Result, C_VideoPath) VALUES (?, NOW(), ?, ?, ?)';
    connection.query(sql, [userId, 0, result.result, videoPath], (dbError, results) => {
      if (dbError) {
        console.error('Error inserting into database:', dbError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const videoId = results.insertId;
      res.status(200).json({ message: 'Video processed and result saved', videoId, result: result.result });
    });
  });
});


app.get('/video-result/:videoId', (req, res) => {
  const videoId = req.params.videoId;

  const sql = 'SELECT C_Result FROM checkvideo WHERE C_Id = ?';
  connection.query(sql, [videoId], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Video result not found' });
    }
    res.status(200).json({ result: results[0].C_Result });
  });
});


//本機影片
app.get('/api/videos/user', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sql = 'SELECT * FROM checkvideo WHERE U_Id = ?';
  console.log('Querying with userId:', userId); // Add this line
  connection.query(sql, [userId], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json({ videos: results });
  });

});


// 反詐騙小知識
app.get('/knowledge', (req, res) => {
  const sql = 'SELECT * FROM knowledge';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching knowledge data: ', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(results);
  });
});
// 設置靜態文件夾
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 監聽端口
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
