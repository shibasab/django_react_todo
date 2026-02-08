import axios, { isAxiosError, type AxiosInstance } from 'axios'

import type {
  ApiError,
  ApiQuery,
  ApiRequest,
  ApiResponse,
  DeleteEndpoints,
  GetEndpoints,
  PostEndpoints,
  PutEndpoints,
} from './apiEndpoints'

import config from '../config'
import { type Result, err, ok } from '../models/result'
import { authToken } from './authToken'

type ApiGetOptions = Readonly<{
  key?: string
  mode?: 'latestOnly'
}>

type ApiGetConfig<Params> = Readonly<{
  params?: Params
  options?: ApiGetOptions
}>

type ApiGetQuery = Readonly<Record<string, unknown>>
type ApiGetConfigAny = ApiGetConfig<ApiGetQuery>

type ApiGetParamsInput<E extends GetEndpoints> =
  ApiQuery<'get', E> extends ApiGetQuery
    ? ApiQuery<'get', E> | ApiGetConfig<ApiQuery<'get', E>> | undefined
    :
        | Readonly<{
            options?: ApiGetOptions
          }>
        | undefined

export type ApiClient = Readonly<{
  get: <E extends GetEndpoints>(url: E, params?: ApiGetParamsInput<E>) => Promise<ApiResponse<'get', E>>
  post: {
    <E extends PostEndpoints>(
      url: E,
      data: ApiRequest<'post', E>,
    ): Promise<Result<ApiResponse<'post', E>, ApiError<'post', E>>>
    <T, E = unknown>(url: string, data?: unknown): Promise<Result<T, E>>
  }
  put: {
    <E extends PutEndpoints>(
      url: E,
      data: ApiRequest<'put', E>,
    ): Promise<Result<ApiResponse<'put', E>, ApiError<'put', E>>>
    <T, E = unknown>(url: string, data?: unknown): Promise<Result<T, E>>
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

export type ApiClientCallbacks = Readonly<{
  onRequestStart: () => void
  onRequestEnd: () => void
}>

export const createApiClient = (
  axiosInstance: AxiosInstance = createAxiosInstance(),
  callbacks: ApiClientCallbacks,
): ApiClient => {
  const { onRequestStart, onRequestEnd } = callbacks
  const abortControllers = new Map<string, AbortController>()

  const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

  const isGetConfig = (value: unknown): value is ApiGetConfigAny => {
    if (!isRecord(value)) {
      return false
    }
    return 'params' in value || 'options' in value
  }

  const resolveParams = (params?: unknown): ApiGetQuery | undefined => {
    if (!isRecord(params)) {
      return undefined
    }
    if (!isGetConfig(params)) {
      return params
    }
    if (!isRecord(params.params)) {
      return undefined
    }
    return params.params
  }

  const resolveOptions = (params?: unknown): ApiGetOptions | undefined =>
    isGetConfig(params) ? params.options : undefined

  const withTracking = async <T>(fn: () => Promise<T>): Promise<T> => {
    onRequestStart?.()
    try {
      return await fn()
    } finally {
      onRequestEnd?.()
    }
  }

  return {
    get: async <E extends GetEndpoints>(url: E, params?: ApiGetParamsInput<E>): Promise<ApiResponse<'get', E>> =>
      withTracking(async () => {
        const resolvedParams = resolveParams(params)
        const resolvedOptions = resolveOptions(params)
        const requestKey = resolvedOptions?.key
        const shouldAbortPrevious = resolvedOptions?.mode === 'latestOnly' && requestKey != null
        let abortController: AbortController | undefined

        if (shouldAbortPrevious && requestKey) {
          abortController = new AbortController()
          abortControllers.get(requestKey)?.abort()
          abortControllers.set(requestKey, abortController)
        }

        try {
          const response = await axiosInstance.get<ApiResponse<'get', E>>(url, {
            params: resolvedParams,
            signal: abortController?.signal,
          })
          return response.data
        } finally {
          if (
            shouldAbortPrevious &&
            requestKey &&
            abortController &&
            abortControllers.get(requestKey) === abortController
          ) {
            abortControllers.delete(requestKey)
          }
        }
      }),

    post: async <T, E>(url: string, data?: unknown): Promise<Result<T, E>> =>
      withTracking(async () => {
        try {
          const response = await axiosInstance.post<T>(url, data)
          return ok(response.data)
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 422) {
            return err(error.response.data as E)
          }
          throw error
        }
      }),

    put: async <T, E>(url: string, data?: unknown): Promise<Result<T, E>> =>
      withTracking(async () => {
        try {
          const response = await axiosInstance.put<T>(url, data)
          return ok(response.data)
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 422) {
            return err(error.response.data as E)
          }
          throw error
        }
      }),

    delete: async <T>(url: string): Promise<T> =>
      withTracking(async () => {
        const response = await axiosInstance.delete<T>(url)
        return response.data
      }),
  }
}
