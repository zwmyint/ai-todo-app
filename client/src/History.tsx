import { useEffect, useState } from "react"
import type { Todo } from "./types/todo"
import { getTodos } from "./api/todos"
import "./App.css"

const PAGE_SIZE = 20

export default function History() {
  const [items, setItems] = useState<Todo[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<string>("createdAt_desc")

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const res = await getTodos({ page, limit: PAGE_SIZE, sort })
        if (mounted) {
          if (Array.isArray(res)) {
            setItems(res)
            setTotal(res.length)
          } else {
            setItems(res.items)
            setTotal(res.total)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [page, sort])

  const handleSort = (newSort: string) => {
    if (newSort === sort) return
    setSort(newSort)
    setPage(1)
  }

  const renderSortHeader = (label: string, ascKey: string, descKey: string) => (
    <th>
      <button type="button" onClick={() => handleSort(ascKey)} aria-pressed={sort === ascKey}>
        {label} ↑
      </button>
      <button type="button" onClick={() => handleSort(descKey)} aria-pressed={sort === descKey}>
        ↓
      </button>
    </th>
  )

  return (
    <section className="history">
      <h2>History</h2>
      {loading && <p className="status">Loading history...</p>}
      {error && <p className="error">{error}</p>}

      <div className="history-meta">
        <span>Total: {total}</span>
        <span>
          Page: {page} / {totalPages}
        </span>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>ID</th>
            {renderSortHeader("Title", "title_asc", "title_desc")}
            <th>Completed</th>
            {renderSortHeader("Created At", "createdAt_asc", "createdAt_desc")}
            {renderSortHeader("Updated At", "updatedAt_asc", "updatedAt_desc")}
            {renderSortHeader("Due Date", "dueDate_asc", "dueDate_desc")}
            <th>Priority</th>
            <th>Notes</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td className="mono">{t.id}</td>
              <td>{t.title}</td>
              <td>{t.completed ? "Yes" : "No"}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{new Date(t.updatedAt).toLocaleString()}</td>
              <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>
              <td>{t.priority ?? 0}</td>
              <td>{t.notes ? (t.notes.length > 100 ? t.notes.slice(0, 100) + "…" : t.notes) : ""}</td>
              <td>{t.category ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button type="button" onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">
          « First
        </button>
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
          ‹ Prev
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">
          Next ›
        </button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page">
          Last »
        </button>
      </div>
    </section>
  )
}
