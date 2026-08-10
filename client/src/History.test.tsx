import '@testing-library/jest-dom'
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import History from "./History"
import * as api from "./api/todos"
import type { Todo } from "./types/todo"

const sampleTodos: Todo[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `id-${i}`,
  title: `Task ${i}`,
  completed: i % 2 === 0,
  createdAt: new Date(2020, 0, i + 1).toISOString(),
  updatedAt: new Date(2020, 0, i + 2).toISOString(),
  dueDate: null,
  priority: i,
  notes: `note-${i}`,
  category: `cat-${i}`,
}))

describe("History component", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders table and pages results, responds to sort clicks", async () => {
    // mock getTodos to return paginated shape
    const getTodosMock = vi.spyOn(api, "getTodos").mockResolvedValue({ items: sampleTodos, total: 3 })

    render(<History />)

    // expect a heading with 'History'
    expect(screen.getByRole('heading', { name: /History/i })).toBeInTheDocument()

    // wait for fetch
    await waitFor(() => expect(getTodosMock).toHaveBeenCalled())

    // rows should be present
    sampleTodos.forEach((t) => expect(screen.getByText(t.title)).toBeInTheDocument())

    // click sort header (Title asc)
    const titleAscButton = screen.getByRole('button', { name: /Title\s*↑/i })
    await userEvent.click(titleAscButton)

    // ensure getTodos was called again with updated sort param
    await waitFor(() => {
      expect(getTodosMock).toHaveBeenCalledWith(expect.objectContaining({ sort: "title_asc" }))
    })
  })
})
