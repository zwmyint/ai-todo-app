import { useEffect, useState } from "react"
import type { Todo } from "./types/todo"
import { getTodos } from "./api/todos"
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'

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

  const toggleSort = (ascKey: string, descKey: string) => {
    // toggle between asc and desc for the given keys
    setPage(1)
    setSort((current) => (current === ascKey ? descKey : ascKey))
  }

  const renderSortableHeader = (label: string, ascKey: string, descKey: string) => {
    const indicator = sort === ascKey ? '▲' : sort === descKey ? '▼' : '↕'
    return (
      <th scope="col">
        <button
          type="button"
          className="btn btn-link p-0"
          onClick={() => toggleSort(ascKey, descKey)}
          aria-pressed={sort === ascKey || sort === descKey}
          aria-label={`Sort by ${label}`}
        >
          {label} <span aria-hidden>{indicator}</span>
        </button>
      </th>
    )
  }

  return (
    <section className="history container mt-3">
      <h2>History</h2>
      {loading && <p className="status">Loading history...</p>}
      {error && <p className="error">{error}</p>}

      <div className="history-meta mb-2 d-flex gap-3">
        <span className="badge bg-secondary">Total: {total}</span>
        <span className="badge bg-secondary">Page: {page} / {totalPages}</span>
      </div>

      <table className="table table-hover table-striped history-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            {renderSortableHeader("Title", "title_asc", "title_desc")}
            <th scope="col">Completed</th>
            {renderSortableHeader("Created At", "createdAt_asc", "createdAt_desc")}
            {renderSortableHeader("Updated At", "updatedAt_asc", "updatedAt_desc")}
            {renderSortableHeader("Due Date", "dueDate_asc", "dueDate_desc")}
            <th scope="col">Priority</th>
            <th scope="col">Notes</th>
            <th scope="col">Category</th>
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

      <div className="pagination d-flex gap-2 align-items-center">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">
          « First
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
          ‹ Prev
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">
          Next ›
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page">
          Last »
        </button>
      </div>
    </section>
  )
}
