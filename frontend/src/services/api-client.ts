import type {
  ApiEndpoint,
  ApiError,
  ApiQuery,
  ApiRequest,
  ApiResponse,
  DeleteEndpoint,
  GetEndpoint,
  PostEndpoint,
  PutEndpoint,
} from '@todoapp/shared'

import config from '../config'
import { type Result, err, ok } from '../models/result'
import { authToken } from './authToken'
import { createFetchClient, isFetchHttpError } from './http/fetch-client'

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

type ApiGetParamsInput<E extends GetEndpoint> =
  ApiQuery<'get', E> extends ApiGetQuery
    ? ApiQuery<'get', E> | ApiGetConfig<ApiQuery<'get', E>> | undefined
    :
        | Readonly<{
            options?: ApiGetOptions
          }>
        | undefined

type ApiPostRequestArgs<E extends PostEndpoint> =
  ApiRequest<'post', E> extends undefined ? readonly [data?: undefined] : readonly [data: ApiRequest<'post', E>]

type ApiPutRequestArgs<E extends PutEndpoint> =
  ApiRequest<'put', E> extends undefined ? readonly [data?: undefined] : readonly [data: ApiRequest<'put', E>]

export type ApiClient = Readonly<{
  get: <E extends GetEndpoint>(url: E, params?: ApiGetParamsInput<E>) => Promise<ApiResponse<'get', E>>
  post: {
    <E extends PostEndpoint>(
      url: E,
      ...args: ApiPostRequestArgs<E>
    ): Promise<Result<ApiResponse<'post', E>, ApiError<'post', E>>>
  }
  put: {
    <E extends PutEndpoint>(
      url: E,
      ...args: ApiPutRequestArgs<E>
    ): Promise<Result<ApiResponse<'put', E>, ApiError<'put', E>>>
  }
  delete: {
    <E extends DeleteEndpoint>(url: E): Promise<ApiResponse<'delete', E>>
  }
}>

export type ApiClientCallbacks = Readonly<{
  onRequestStart: () => void
  onRequestEnd: () => void
}>

export type ApiClientOptions = Readonly<{
  fetchImpl?: typeof fetch
}>

export const createApiClient = (options: ApiClientOptions = {}, callbacks: ApiClientCallbacks): ApiClient => {
  const { onRequestStart, onRequestEnd } = callbacks
  const latestOnlyRequests = new Map<string, { abort: () => void }>()

  const fetchClient = createFetchClient({
    baseURL: config.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    fetchImpl: options.fetchImpl,
  })

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

  const toAuthorizationHeaders = (): HeadersInit => {
    const token = authToken.get()
    if (token == null) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`,
    }
  }

  const toHandledApiError = <M extends 'post' | 'put', E extends ApiEndpoint<M>>(
    error: unknown,
  ): ApiError<M, E> | null => {
    if (!isFetchHttpError(error)) {
      return null
    }

    if (error.status !== 409 && error.status !== 422) {
      return null
    }

    return error.body as ApiError<M, E>
  }

  return {
    get: async <E extends GetEndpoint>(url: E, params?: ApiGetParamsInput<E>): Promise<ApiResponse<'get', E>> =>
      withTracking(async () => {
        const resolvedParams = resolveParams(params)
        const resolvedOptions = resolveOptions(params)
        const requestKey = resolvedOptions?.key
        const shouldAbortPrevious = resolvedOptions?.mode === 'latestOnly' && requestKey != null
        let abortController: AbortController | undefined
        let abortCurrent: (() => void) | undefined

        if (shouldAbortPrevious && requestKey) {
          latestOnlyRequests.get(requestKey)?.abort()

          abortController = new AbortController()
          abortCurrent = () => {
            abortController?.abort()
          }
          latestOnlyRequests.set(requestKey, { abort: abortCurrent })
        }

        try {
          return fetchClient.request<ApiResponse<'get', E>>({
            method: 'GET',
            url,
            query: resolvedParams,
            signal: abortController?.signal,
            headers: toAuthorizationHeaders(),
          })
        } finally {
          if (
            shouldAbortPrevious &&
            requestKey &&
            abortCurrent &&
            latestOnlyRequests.get(requestKey)?.abort === abortCurrent
          ) {
            latestOnlyRequests.delete(requestKey)
          }
        }
      }),

    post: async <E extends PostEndpoint>(
      url: E,
      ...args: ApiPostRequestArgs<E>
    ): Promise<Result<ApiResponse<'post', E>, ApiError<'post', E>>> =>
      withTracking(async () => {
        const data = args[0]
        try {
          const response = await fetchClient.request<ApiResponse<'post', E>>({
            method: 'POST',
            url,
            body: data,
            headers: toAuthorizationHeaders(),
          })
          return ok(response)
        } catch (error) {
          const handledError = toHandledApiError<'post', E>(error)
          if (handledError != null) {
            return err(handledError)
          }
          throw error
        }
      }),

    put: async <E extends PutEndpoint>(
      url: E,
      ...args: ApiPutRequestArgs<E>
    ): Promise<Result<ApiResponse<'put', E>, ApiError<'put', E>>> =>
      withTracking(async () => {
        const data = args[0]
        try {
          const response = await fetchClient.request<ApiResponse<'put', E>>({
            method: 'PUT',
            url,
            body: data,
            headers: toAuthorizationHeaders(),
          })
          return ok(response)
        } catch (error) {
          const handledError = toHandledApiError<'put', E>(error)
          if (handledError != null) {
            return err(handledError)
          }
          throw error
        }
      }),

    delete: async <E extends DeleteEndpoint>(url: E): Promise<ApiResponse<'delete', E>> =>
      withTracking(async () =>
        fetchClient.request<ApiResponse<'delete', E>>({
          method: 'DELETE',
          url,
          headers: toAuthorizationHeaders(),
        }),
      ),
  }
}
