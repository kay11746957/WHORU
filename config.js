// API 配置文件 - 集中管理所有 API 端點
// 只需要在這裡修改一次，所有頁面都會自動更新

// 每次重新啟動 ngrok 後，只需要更新下面這一行的 URL
const API_BASE_URL = 'https://217a1622651f.ngrok-free.app';

// 導出配置
export const Config = {
    // 基礎 API URL
    API_URL: API_BASE_URL,

    // 各個端點（可以直接使用）
    ENDPOINTS: {
        register: `${API_BASE_URL}/register`,
        login: `${API_BASE_URL}/login`,
        forgot: `${API_BASE_URL}/forgot`,
        editPassword: `${API_BASE_URL}/edit-password`,
        upload: `${API_BASE_URL}/upload`,
        videoResult: (videoId) => `${API_BASE_URL}/video-result/${videoId}`,
        userVideos: `${API_BASE_URL}/api/videos/user`,
        knowledge: `${API_BASE_URL}/knowledge`,
    }
};

// 預設導出
export default Config;
