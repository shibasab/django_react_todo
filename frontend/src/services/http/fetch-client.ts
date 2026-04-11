export type FetchQuery = Readonly<Record<string, unknown>>

export type FetchRequestOptions = Readonly<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers?: HeadersInit
  signal?: AbortSignal
  query?: FetchQuery
  body?: unknown
}>

export type CreateFetchClientOptions = Readonly<{
  baseURL?: string
  headers?: HeadersInit
  fetchImpl?: typeof fetch
}>

export class FetchHttpError extends Error {
  readonly kind = 'http'

  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly data: unknown,
  ) {
    super(`HTTP ${status} ${statusText}`)
  }
}

export class FetchNetworkError extends Error {
  readonly kind = 'network'

  constructor(readonly cause: unknown) {
    super('Network error')
  }
}

export class FetchAbortError extends Error {
  readonly kind = 'abort'

  constructor() {
    super('Request aborted')
  }
}

const isAbortError = (error: unknown): boolean => error instanceof Error && error.name === 'AbortError'

const appendQuery = (searchParams: URLSearchParams, key: string, value: unknown): void => {
  if (value == null) {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendQuery(searchParams, key, item)
    }
    return
  }

  searchParams.append(key, String(value))
}

const withQuery = (url: string, query?: FetchQuery): string => {
  if (query == null || Object.keys(query).length === 0) {
    return url
  }

  const parsed = new URL(url, 'http://localhost')
  for (const [key, value] of Object.entries(query)) {
    appendQuery(parsed.searchParams, key, value)
  }

  return `${parsed.pathname}${parsed.search}`
}

const resolveBaseURL = (baseURL: string): string => {
  if (/^https?:\/\//.test(baseURL)) {
    return baseURL
  }

  const origin =
    typeof window !== 'undefined' && typeof window.location?.origin === 'string'
      ? window.location.origin
      : 'http://localhost'

  return new URL(baseURL, origin).toString()
}

const joinUrl = (baseURL: string | undefined, url: string): string => {
  if (!baseURL) {
    return url
  }
  return new URL(url, resolveBaseURL(baseURL)).toString()
}

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  if (text.trim() === '') {
    return undefined
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const createFetchClient = ({
  baseURL,
  headers: defaultHeaders,
  fetchImpl = fetch,
}: CreateFetchClientOptions = {}) => {
  const request = async <T>({ method, url, headers, signal, query, body }: FetchRequestOptions): Promise<T> => {
    const mergedHeaders = new Headers(defaultHeaders)
    new Headers(headers).forEach((value, key) => mergedHeaders.set(key, value))

    const resolvedUrl = joinUrl(baseURL, withQuery(url, query))

    try {
      const response = await fetchImpl(resolvedUrl, {
        method,
        headers: mergedHeaders,
        signal,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })

      const responseBody = await parseResponseBody(response)

      if (!response.ok) {
        throw new FetchHttpError(response.status, response.statusText, responseBody)
      }

      return responseBody as T
    } catch (error) {
      if (error instanceof FetchHttpError) {
        throw error
      }
      if (isAbortError(error)) {
        throw new FetchAbortError()
      }
      throw new FetchNetworkError(error)
    }
  }

  return { request }
}

export const isFetchHttpError = (error: unknown): error is FetchHttpError => error instanceof FetchHttpError
