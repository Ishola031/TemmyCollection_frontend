import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
    withCredentials: true,
})

console.log("API BASE URL:", api.defaults.baseURL)

api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config;
        if (!error.response) {
            console.error(error);
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(
                    'http://localhost:8000/api/a/token/refresh/', {}, {
                    withCredentials: true,
                }
                );
                return api(originalRequest);
            } catch (refreshError) {
                console.log("refresh error")
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error)
    }
);

export default api