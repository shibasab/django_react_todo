import axios, { type AxiosInstance } from 'axios'

import config from '../config'
import { authToken } from './authToken'

type RequestConfig = Readonly<{}>

export type ApiClient = Readonly<{
  get: <T>(url: string, config?: RequestConfig) => Promise<T>
  post: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  put: <T>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>
}>

/**
 * Axios インスタンス作成
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // リクエストインターセプター: トークン自動付与
  instance.interceptors.request.use((config) => {
    const token = authToken.get()
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return instance
}

export const createApiClient = (axiosInstance: AxiosInstance = createAxiosInstance()): ApiClient => ({
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
