import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

import config from '../config'

type RequestConfig = Readonly<{}>

type ApiClient = Readonly<{
  get: <T>(url: string, config?: RequestConfig) => Promise<T>
  post: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  put: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>
}>


/**
 * トークンストレージ
 */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem('token'),
  set: (token: string): void => localStorage.setItem('token', token),
  remove: (): void => localStorage.removeItem('token'),
}

/**
 * Axios インスタンス作成
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL:  config.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // リクエストインターセプター: トークン自動付与
  instance.interceptors.request.use((config) => {
    const token = tokenStorage.get()
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return instance
}

const createApiClient = (axiosInstance: AxiosInstance): ApiClient => ({
  get: async <T>(url: string, config?: RequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config)
    return response.data
  },

  post: async <T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config)
    return response.data
  },

  put: async <T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config)
    return response.data
  },

  delete: async <T>(url: string, config?: RequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config)
    return response.data
  },
})

export const apiClient = createApiClient(createAxiosInstance())
