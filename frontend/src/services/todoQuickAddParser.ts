export type QuickAddParseResult = Readonly<{
  name: string
  dueDate: string | null
}>

type DueDateMatch = Readonly<{
  index: number
  text: string
  dueDate: string
}>

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()

const toDateOnly = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toNextWeekFriday = (baseDate: Date): string => {
  const dayOfWeek = baseDate.getDay()
  const mondayIndex = (dayOfWeek + 6) % 7
  const daysUntilNextMonday = 7 - mondayIndex
  const nextWeekFriday = addDays(baseDate, daysUntilNextMonday + 4)
  return toIsoDate(nextWeekFriday)
}

const parseIsoDate = (value: string): string | null => {
  const [year, month, day] = value.split('-').map((part) => Number(part))
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const parsed = new Date(year, month - 1, day)
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null
  }
  return value
}

const findDateMatches = (input: string, baseDate: Date): readonly DueDateMatch[] => {
  const normalizedBaseDate = toDateOnly(baseDate)
  const fixedPatterns: readonly Readonly<{
    regex: RegExp
    resolve: (base: Date) => string
  }>[] = [
    { regex: /今日/, resolve: (base) => toIsoDate(base) },
    { regex: /明日/, resolve: (base) => toIsoDate(addDays(base, 1)) },
    { regex: /明後日/, resolve: (base) => toIsoDate(addDays(base, 2)) },
    { regex: /来週(?:の)?金曜(?:日)?/, resolve: (base) => toNextWeekFriday(base) },
  ]

  const matches = fixedPatterns
    .map((pattern) => {
      const matched = pattern.regex.exec(input)
      if (matched == null || matched.index == null) {
        return null
      }
      return {
        index: matched.index,
        text: matched[0],
        dueDate: pattern.resolve(normalizedBaseDate),
      } as const
    })
    .filter((value): value is DueDateMatch => value != null)

  const isoMatch = /\d{4}-\d{2}-\d{2}/.exec(input)
  if (isoMatch != null && isoMatch.index != null) {
    const dueDate = parseIsoDate(isoMatch[0])
    if (dueDate != null) {
      return [...matches, { index: isoMatch.index, text: isoMatch[0], dueDate }]
    }
  }

  return matches
}

const chooseFirstDateMatch = (matches: readonly DueDateMatch[]): DueDateMatch | null => {
  if (matches.length === 0) {
    return null
  }

  return [...matches].sort((a, b) => {
    if (a.index !== b.index) {
      return a.index - b.index
    }
    return b.text.length - a.text.length
  })[0]
}

export const parseTodoQuickAddInput = (rawInput: string, baseDate: Date = new Date()): QuickAddParseResult => {
  const normalizedInput = normalizeWhitespace(rawInput)
  if (normalizedInput === '') {
    return { name: '', dueDate: null }
  }

  const matchedDate = chooseFirstDateMatch(findDateMatches(normalizedInput, baseDate))
  if (matchedDate == null) {
    return { name: normalizedInput, dueDate: null }
  }

  const removedDateExpression = normalizeWhitespace(
    `${normalizedInput.slice(0, matchedDate.index)} ${normalizedInput.slice(matchedDate.index + matchedDate.text.length)}`,
  )

  return {
    name: removedDateExpression === '' ? normalizedInput : removedDateExpression,
    dueDate: matchedDate.dueDate,
  }
}
