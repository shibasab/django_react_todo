import { AxiosError, type AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../../src/services/api'

type AxiosMock = Readonly<{
  instance: AxiosInstance
  getMock: ReturnType<typeof vi.fn>
  postMock: ReturnType<typeof vi.fn>
  putMock: ReturnType<typeof vi.fn>
  deleteMock: ReturnType<typeof vi.fn>
}>

describe('createApiClient', () => {
  const createCallbacks = () => ({
    onRequestStart: vi.fn(),
    onRequestEnd: vi.fn(),
  })

  const createAxiosMock = (): AxiosMock => {
    const getMock = vi.fn()
    const postMock = vi.fn()
    const putMock = vi.fn()
    const deleteMock = vi.fn()

    return {
      instance: {
        get: getMock,
        post: postMock,
        put: putMock,
        delete: deleteMock,
      } as unknown as AxiosInstance,
      getMock,
      postMock,
      putMock,
      deleteMock,
    }
  }

  it('GET: paramsオブジェクトをそのままクエリに渡して結果を返す', async () => {
    const callbacks = createCallbacks()
    const axiosMock = createAxiosMock()
    axiosMock.getMock.mockResolvedValue({ data: [{ id: 1, name: 'todo' }] })
    const client = createApiClient(axiosMock.instance, callbacks)

    const response = await client.get('/todo/', { keyword: 'todo' })

    expect(response).toMatchSnapshot('get-response')
    expect(axiosMock.getMock).toHaveBeenCalledTimes(1)
    expect(axiosMock.getMock).toMatchSnapshot('get-call')
    expect(callbacks.onRequestStart).toHaveBeenCalledTimes(1)
    expect(callbacks.onRequestEnd).toHaveBeenCalledTimes(1)
  })

  it('GET: latestOnly指定時は同一キーの前回リクエストをabortする', async () => {
    const callbacks = createCallbacks()
    const axiosMock = createAxiosMock()
    const signals: AbortSignal[] = []

    let resolveFirst: (() => void) | undefined
    const firstPending = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })

    axiosMock.getMock.mockImplementation(async (_url, config) => {
      if (config?.signal != null) {
        signals.push(config.signal)
      }
      if (signals.length === 1) {
        await firstPending
      }
      return { data: [] }
    })

    const client = createApiClient(axiosMock.instance, callbacks)

    const firstRequest = client.get('/todo/', {
      params: { keyword: 'first' },
      options: { key: 'search', mode: 'latestOnly' },
    })
    await Promise.resolve()
    const secondRequest = client.get('/todo/', {
      params: { keyword: 'second' },
      options: { key: 'search', mode: 'latestOnly' },
    })
    resolveFirst?.()
    await Promise.all([firstRequest, secondRequest])

    expect(signals.length).toBe(2)
    expect(signals[0]?.aborted).toBe(true)
    expect(signals[1]?.aborted).toBe(false)
    expect(signals.map((signal) => signal.aborted)).toMatchSnapshot('latest-only-abort-states')
  })

  it('POST: 422エラーをResult.errとして返す', async () => {
    const callbacks = createCallbacks()
    const axiosMock = createAxiosMock()
    const validationError = { status: 422, type: 'validation_error', errors: [{ field: 'name', reason: 'required' }] }

    const axiosError = new AxiosError('validation failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: {} } as never,
      data: validationError,
    })

    axiosMock.postMock.mockRejectedValue(axiosError)

    const client = createApiClient(axiosMock.instance, callbacks)
    const result = await client.post('/todo/', { name: '' })

    expect(result).toMatchSnapshot()
  })

  it('PUT: 422以外のエラーはそのままthrowする', async () => {
    const callbacks = createCallbacks()
    const axiosMock = createAxiosMock()
    const axiosError = new AxiosError('server error', 'ERR_BAD_RESPONSE', undefined, undefined, {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: { headers: {} } as never,
      data: { detail: 'oops' },
    })

    axiosMock.putMock.mockRejectedValue(axiosError)

    const client = createApiClient(axiosMock.instance, callbacks)

    await expect(client.put('/todo/1/', { name: 'x' })).rejects.toThrow('server error')
  })

  it('DELETE: レスポンスデータを返す', async () => {
    const callbacks = createCallbacks()
    const axiosMock = createAxiosMock()
    axiosMock.deleteMock.mockResolvedValue({ data: { ok: true } })
    const client = createApiClient(axiosMock.instance, callbacks)

    const result = await client.delete('/todo/1/')

    expect(result).toMatchSnapshot()
  })
})
