import { describe, expect, it } from 'vitest'

import { parseTodoQuickAddInput } from '../../src/services/todoQuickAddParser'

const BASE_DATE = new Date(2026, 1, 9)

describe('parseTodoQuickAddInput', () => {
  it('今日を期限として解釈する', () => {
    const result = parseTodoQuickAddInput('今日 買い物', BASE_DATE)

    expect(result).toEqual({
      name: '買い物',
      dueDate: '2026-02-09',
    })
  })

  it('明日を期限として解釈する', () => {
    const result = parseTodoQuickAddInput('明日 会議資料準備', BASE_DATE)

    expect(result).toEqual({
      name: '会議資料準備',
      dueDate: '2026-02-10',
    })
  })

  it('明後日を期限として解釈する', () => {
    const result = parseTodoQuickAddInput('明後日 連絡', BASE_DATE)

    expect(result).toEqual({
      name: '連絡',
      dueDate: '2026-02-11',
    })
  })

  it('来週金曜を次週金曜として解釈する（月曜始まり）', () => {
    const result = parseTodoQuickAddInput('来週金曜 リリース準備', BASE_DATE)

    expect(result).toEqual({
      name: 'リリース準備',
      dueDate: '2026-02-20',
    })
  })

  it('YYYY-MM-DD形式の日付を期限として解釈する', () => {
    const result = parseTodoQuickAddInput('2026-02-20 請求書確認', BASE_DATE)

    expect(result).toEqual({
      name: '請求書確認',
      dueDate: '2026-02-20',
    })
  })

  it('期限表現が複数ある場合は最初に見つかった1件を採用する', () => {
    const result = parseTodoQuickAddInput('来週金曜 2026-03-01 仕様確認', BASE_DATE)

    expect(result).toEqual({
      name: '2026-03-01 仕様確認',
      dueDate: '2026-02-20',
    })
  })

  it('解析不能な語句を含んでも入力をそのまま名前にして保存する', () => {
    const result = parseTodoQuickAddInput('この文章は自然文期限なし', BASE_DATE)

    expect(result).toEqual({
      name: 'この文章は自然文期限なし',
      dueDate: null,
    })
  })

  it('期限語句除去後に空になった場合は元入力を名前として保持する', () => {
    const result = parseTodoQuickAddInput('明日', BASE_DATE)

    expect(result).toEqual({
      name: '明日',
      dueDate: '2026-02-10',
    })
  })

  it('不正な日付値は期限として解釈しない', () => {
    const result = parseTodoQuickAddInput('2026-02-30 請求書確認', BASE_DATE)

    expect(result).toEqual({
      name: '2026-02-30 請求書確認',
      dueDate: null,
    })
  })
})
