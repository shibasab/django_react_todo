import axios, { CanceledError } from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../../src/services/api'

describe('ApiClient behavior', () => {
  let axiosInstance = axios.create()
  let mock = new AxiosMockAdapter(axiosInstance)

  beforeEach(() => {
    axiosInstance = axios.create()
    mock = new AxiosMockAdapter(axiosInstance)
  })

  it('GETはparamsをそのままクエリに変換する', async () => {
    mock.onGet('/todo/', { params: { keyword: 'abc' } }).reply(200, [])

    const apiClient = createApiClient(axiosInstance, {
      onRequestStart: () => {},
      onRequestEnd: () => {},
    })

    await apiClient.get('/todo/', { keyword: 'abc' })

    expect(mock.history.get).toHaveLength(1)
    expect(mock.history.get[0]?.params).toEqual({ keyword: 'abc' })
  })

  it('GETはconfig形式でもparamsを解釈する', async () => {
    mock.onGet('/todo/', { params: { progressStatus: 'completed' } }).reply(200, [])

    const apiClient = createApiClient(axiosInstance, {
      onRequestStart: () => {},
      onRequestEnd: () => {},
    })

    await apiClient.get('/todo/', {
      params: { progressStatus: 'completed' },
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    expect(mock.history.get).toHaveLength(1)
    expect(mock.history.get[0]?.params).toEqual({ progressStatus: 'completed' })
  })

  it('POSTの422はResult.errで返す', async () => {
    mock.onPost('/todo/').reply(422, {
      status: 422,
      type: 'validation_error',
      errors: [{ field: 'name', reason: 'required' }],
    })

    const apiClient = createApiClient(axiosInstance, {
      onRequestStart: () => {},
      onRequestEnd: () => {},
    })

    const result = await apiClient.post('/todo/', {
      name: '',
      detail: '',
      dueDate: null,
      progressStatus: 'not_started',
      recurrenceType: 'none',
      parentId: null,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.status).toBe(422)
    }
  })

  it('対象外ステータスのエラーはthrowしつつコールバックを完了させる', async () => {
    mock.onPost('/auth/register').reply(500, {
      detail: 'server error',
    })

    const onRequestStart = vi.fn()
    const onRequestEnd = vi.fn()

    const apiClient = createApiClient(axiosInstance, {
      onRequestStart,
      onRequestEnd,
    })

    await expect(
      apiClient.post('/auth/register', {
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow()

    expect(onRequestStart).toHaveBeenCalledTimes(1)
    expect(onRequestEnd).toHaveBeenCalledTimes(1)
  })

  it('latestOnlyでは同一キーの先行リクエストを中断する', async () => {
    let firstRequest = true
    let firstAborted = false

    mock.onGet('/todo/').reply((config) => {
      if (firstRequest) {
        firstRequest = false
        return new Promise((_, reject) => {
          const signal = config.signal
          if (signal == null || typeof signal.addEventListener !== 'function') {
            reject(new Error('AbortSignal is required'))
            return
          }
          signal.addEventListener('abort', () => {
            firstAborted = true
            reject(new CanceledError('canceled'))
          })
        })
      }
      return [200, []]
    })

    const apiClient = createApiClient(axiosInstance, {
      onRequestStart: () => {},
      onRequestEnd: () => {},
    })

    const first = apiClient.get('/todo/', {
      options: { key: 'todo-search', mode: 'latestOnly' },
    })
    const second = apiClient.get('/todo/', {
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    await expect(first).rejects.toThrow()
    await expect(second).resolves.toEqual([])
    expect(firstAborted).toBe(true)
  })
})
