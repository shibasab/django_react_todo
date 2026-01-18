export type Result<T, E> = Readonly<{ ok: true; data: T }> | Readonly<{ ok: false; error: E }>

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
