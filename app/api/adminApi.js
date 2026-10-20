import axios from "axios"

const adminApi = axios.create({
    baseURL: "http://localhost:8000/api/admin/v2/",
    withCredentials: true
})

let isRefreshing = false
let failedRequests = []

const processQueue = (error) => {

    failedRequests.forEach((promise) => {

        if (error) {
            promise.reject(error)
        } else {
            promise.resolve()
        }

    })

    failedRequests = []
}

adminApi.interceptors.response.use(
    (response) => {
        return response
    },

    async (error) => {

        const originalRequest = error.config

        if (
            error.response?.status !== 401 ||
            originalRequest?._retry
        ) {
            return Promise.reject(error)
        }

        if (
            originalRequest.url?.includes("/login/") ||
            originalRequest.url?.includes("/refresh/")
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        if (isRefreshing) {

            return new Promise((resolve, reject) => {

                failedRequests.push({
                    resolve,
                    reject
                })

            }).then(() => {
                return adminApi(originalRequest)
            })
        }

        isRefreshing = true

        try {

            await axios.post("http://localhost:8000/api/admin/v2/refresh/",{},
                {
                    withCredentials: true
                }
            )

            processQueue(null)

            return adminApi(originalRequest)

        } catch (refreshError) {

            processQueue(refreshError)

            return Promise.reject(refreshError)

        } finally {
            isRefreshing = false
        }
    }
)

export default adminApi