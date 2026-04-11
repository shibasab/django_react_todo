import { describe, expect, it } from 'vitest'

import { setupHttpFixtureTest } from '../helpers/httpMock'

describe('ApiClient runtime error handling', () => {
  it('POST /auth/register で422をResult.errとして返す', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/register',
          status: 422,
          response: {
            status: 422,
            type: 'validation_error',
            detail: 'email is invalid',
          },
        },
      ],
    })

    const result = await apiClient.post('/auth/register', {
      username: 'user',
      email: 'invalid-mail',
      password: 'password123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 422,
        type: 'validation_error',
        detail: 'email is invalid',
      })
    }
    restore()
  })

  it('PUT /todo/:id で409をResult.errとして返す', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'PUT',
          url: '/todo/20/',
          status: 409,
          response: {
            status: 409,
            type: 'conflict_error',
            detail: '未完了のサブタスクがあるため完了できません',
          },
        },
      ],
    })

    const result = await apiClient.put('/todo/20/', {
      dueDate: undefined,
      progressStatus: 'completed',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 409,
        type: 'conflict_error',
        detail: '未完了のサブタスクがあるため完了できません',
      })
    }
    restore()
  })

  it('POST /auth/register で409をResult.errとして返す', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/register',
          status: 409,
          response: {
            status: 409,
            type: 'conflict_error',
            detail: 'Username already registered',
          },
        },
      ],
    })

    const result = await apiClient.post('/auth/register', {
      username: 'taken',
      email: 'taken@example.com',
      password: 'password123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 409,
        type: 'conflict_error',
        detail: 'Username already registered',
      })
    }
    restore()
  })

  it('PUT /todo/:id で500は例外送出する', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'PUT',
          url: '/todo/20/',
          status: 500,
          response: { detail: 'internal error' },
        },
      ],
    })

    await expect(
      apiClient.put('/todo/20/', {
        dueDate: undefined,
        progressStatus: 'completed',
      }),
    ).rejects.toMatchObject({ status: 500 })
    restore()
  })
})
