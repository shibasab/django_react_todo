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

export const parseJsonSafely = async (response: Response): Promise<unknown> => {
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

export class HttpError extends Error {
  readonly kind = 'http'

  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body: unknown,
    readonly headers: Headers,
  ) {
    super(`HTTP ${status} ${statusText}`)
  }

  get data(): unknown {
    return this.body
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

      const responseBody = await parseJsonSafely(response)

      if (!response.ok) {
        throw new HttpError(response.status, response.statusText, responseBody, response.headers)
      }

      return responseBody as T
    } catch (error) {
      if (error instanceof HttpError) {
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

export const FetchHttpError = HttpError
export const isFetchHttpError = (error: unknown): error is HttpError => error instanceof HttpError
