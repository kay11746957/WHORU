// 後端 API 配置文件
// 每次重新啟動 ngrok 後，只需要更新下面這一行的 URL

const API_BASE_URL = 'https://217a1622651f.ngrok-free.app';

module.exports = {
    API_BASE_URL,
    // 各個端點
    RESET_PASSWORD_URL: `${API_BASE_URL}/reset-password`
};
