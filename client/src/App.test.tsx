import '@testing-library/jest-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./api/todos', () => ({
  getTodos: vi.fn(),
  addTodo: vi.fn(),
  editTodo: vi.fn(),
  removeTodo: vi.fn(),
}))

const todoApi = await import('./api/todos')
const { default: App } = await import('./App')

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders todos and adds a new item', async () => {
    const todos: Todo[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: '2026-08-01', updatedAt: '2026-08-01' },
    ]

    const mockedGetTodos = todoApi.getTodos as unknown as ReturnType<typeof vi.fn>
    const mockedAddTodo = todoApi.addTodo as unknown as ReturnType<typeof vi.fn>

    mockedGetTodos.mockResolvedValue(todos)
    mockedAddTodo.mockResolvedValue({
      id: '2',
      title: 'New Task',
      completed: false,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    })

    render(<App />)

    expect(await screen.findByText('Task 1')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Add a new task...')
    const button = screen.getByRole('button', { name: /add/i })

    await userEvent.type(input, 'New Task')
    await userEvent.click(button)

    expect(mockedAddTodo).toHaveBeenCalledWith('New Task')
    expect(await screen.findByText('New Task')).toBeInTheDocument()
  })
})
