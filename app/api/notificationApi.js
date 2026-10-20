
import adminApi from "../api/adminApi";

const BASE_URL = "http://localhost:8000/api/notifications/admin/";

const notificationApi = {
  async getNotifications(params = {}) {
    const response = await adminApi.get(BASE_URL, { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await adminApi.get(`${BASE_URL}unread-count/`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await adminApi.post(`${BASE_URL}${id}/read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await adminApi.post(`${BASE_URL}read-all/`);
    return response.data;
  },
};

export default notificationApi;
