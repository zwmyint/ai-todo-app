import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addTodo, editTodo, getTodos, removeTodo } from './todos'

declare global {
  var fetch: typeof fetch
}

const mockResponse = (payload: unknown, ok = true) => ({
  ok,
  json: async () => payload,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('todo API client', () => {
  it('loads todos', async () => {
    const todos = [{ id: '1', title: 'Hello', completed: false, createdAt: '2026-08-01', updatedAt: '2026-08-01' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ data: todos })))

    const result = await getTodos()
    expect(result).toEqual(todos)
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('creates a todo', async () => {
    const created = { id: '2', title: 'New Todo', completed: false, createdAt: '2026-08-01', updatedAt: '2026-08-01' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ data: created })))

    const result = await addTodo('New Todo')
    expect(result).toEqual(created)
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('updates a todo', async () => {
    const updated = { id: '1', title: 'Updated', completed: true, createdAt: '2026-08-01', updatedAt: '2026-08-01' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ data: updated })))

    const result = await editTodo('1', { completed: true })
    expect(result).toEqual(updated)
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('deletes a todo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    await expect(removeTodo('1')).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('throws when API returns error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ error: 'bad request' }, false)))

    await expect(getTodos()).rejects.toThrow('bad request')
  })
})
