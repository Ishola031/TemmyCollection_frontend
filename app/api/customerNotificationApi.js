
import api from "../api/api";

const BASE_URL = "/api/notifications/customer/";

const notificationApi = {
  async getNotifications(params = {}) {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get(`${BASE_URL}unread-count/`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.post(`${BASE_URL}${id}/read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post(`${BASE_URL}read-all/`);
    return response.data;
  },
};

export default notificationApi;
