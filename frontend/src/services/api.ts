import axios, { type AxiosInstance } from 'axios'

import type {
  ApiRequest,
  ApiResponse,
  DeleteEndpoints,
  GetEndpoints,
  PostEndpoints,
  PutEndpoints,
} from './apiEndpoints'

import config from '../config'
import { authToken } from './authToken'

export type ApiClient = Readonly<{
  get: {
    <E extends GetEndpoints>(url: E): Promise<ApiResponse<'get', E>>
    <T>(url: string): Promise<T>
  }
  post: {
    <E extends PostEndpoints>(url: E, data: ApiRequest<'post', E>): Promise<ApiResponse<'post', E>>
    <T>(url: string, data?: unknown): Promise<T>
  }
  put: {
    <E extends PutEndpoints>(url: E, data: ApiRequest<'put', E>): Promise<ApiResponse<'put', E>>
    <T>(url: string, data?: unknown): Promise<T>
  }
  delete: {
    <E extends DeleteEndpoints>(url: E): Promise<ApiResponse<'delete', E>>
    <T = void>(url: string): Promise<T>
  }
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
  get: async <T>(url: string): Promise<T> => {
    const response = await axiosInstance.get<T>(url)
    return response.data
  },

  post: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data)
    return response.data
  },

  put: async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data)
    return response.data
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(url)
    return response.data
  },
})
