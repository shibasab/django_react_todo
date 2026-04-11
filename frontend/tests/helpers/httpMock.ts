import { createApiClient, type ApiClient } from '../../src/services/api'
import { loadFixture } from './fixtures'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type FixtureRoute = Readonly<{
  method: HttpMethod
  url: string
  status?: number
  response?: unknown
  responseFixture?: string
  once?: boolean
}>

type FixtureScenario = Readonly<{
  routes: readonly FixtureRoute[]
}>

type SetupHttpFixtureTestOptions = Readonly<{
  routes?: readonly FixtureRoute[]
  scenarioFixture?: string
  strictUnhandled?: boolean
}>

export type RequestLogEntry = Readonly<{
  method: HttpMethod
  url: string
  query?: unknown
  body?: unknown
}>

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value == null || typeof value !== 'object') {
    return false
  }
  return Object.getPrototypeOf(value) === Object.prototype
}

const isHttpMethod = (value: unknown): value is HttpMethod =>
  value === 'GET' || value === 'POST' || value === 'PUT' || value === 'DELETE'

const isFixtureRoute = (value: unknown): value is FixtureRoute => {
  if (!isPlainObject(value)) {
    return false
  }

  return isHttpMethod(value.method) && typeof value.url === 'string'
}

const isFixtureScenario = (value: unknown): value is FixtureScenario =>
  isPlainObject(value) && Array.isArray(value.routes) && value.routes.every(isFixtureRoute)

const toSortedValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => toSortedValue(item))
  }
  if (!isPlainObject(value)) {
    return value
  }

  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries.map(([key, item]) => [key, toSortedValue(item)]))
}

const toQueryRecord = (searchParams: URLSearchParams): Record<string, string | readonly string[]> => {
  const grouped = new Map<string, string[]>()

  for (const [key, value] of searchParams.entries()) {
    const current = grouped.get(key)
    if (current) {
      current.push(value)
      continue
    }
    grouped.set(key, [value])
  }

  const result: Record<string, string | readonly string[]> = {}
  for (const [key, values] of grouped.entries()) {
    result[key] = values.length === 1 ? values[0] : values
  }
  return result
}

const parseBody = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return data
  }

  const trimmed = data.trim()
  if (trimmed === '') {
    return undefined
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return data
  }
}

const normalizeRequest = (input: string, init?: RequestInit): RequestLogEntry => {
  const method = (init?.method?.toUpperCase() ?? 'GET') as HttpMethod
  const parsedUrl = new URL(input)
  const query = toSortedValue(toQueryRecord(parsedUrl.searchParams))
  const body = toSortedValue(parseBody(init?.body))

  return {
    method,
    url: parsedUrl.pathname,
    ...(isPlainObject(query) && Object.keys(query).length === 0 ? {} : { query }),
    ...(body === undefined ? {} : { body }),
  }
}

const resolveScenarioRoutes = (scenarioFixture?: string): readonly FixtureRoute[] => {
  if (!scenarioFixture) {
    return []
  }

  const scenario = loadFixture(scenarioFixture)
  if (!isFixtureScenario(scenario)) {
    throw new Error(`Invalid fixture scenario format: ${scenarioFixture}`)
  }

  return scenario.routes
}

const resolveRouteBody = (route: FixtureRoute): unknown => {
  if (route.responseFixture) {
    return loadFixture(route.responseFixture)
  }
  if ('response' in route) {
    return route.response
  }
  return null
}

export const setupHttpFixtureTest = ({
  routes = [],
  scenarioFixture,
  strictUnhandled = true,
}: SetupHttpFixtureTestOptions = {}) => {
  const requestLog: RequestLogEntry[] = []
  const allRoutes = [...resolveScenarioRoutes(scenarioFixture), ...routes]

  const fetchImpl: typeof fetch = async (input, init) => {
    const request = normalizeRequest(String(input), init)
    requestLog.push(request)

    const routeIndex = allRoutes.findIndex((route) => route.method === request.method && route.url === request.url)
    if (routeIndex < 0) {
      if (strictUnhandled) {
        throw new Error(`Unhandled mock request: ${request.method} ${request.url}`)
      }

      return new Response(JSON.stringify(null), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const route = allRoutes[routeIndex]
    if (route?.once) {
      allRoutes.splice(routeIndex, 1)
    }

    return new Response(JSON.stringify(resolveRouteBody(route)), {
      status: route?.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const noop = () => {}
  const apiClient: ApiClient = createApiClient(
    { fetchImpl },
    {
      onRequestStart: noop,
      onRequestEnd: noop,
    },
  )

  return {
    apiClient,
    requestLog,
    clearRequests: () => {
      requestLog.length = 0
    },
    restore: () => {},
  } as const
}
