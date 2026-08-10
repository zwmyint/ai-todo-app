import "./App.css"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import History from "./History"
import ListPage from "./ListPage"

export default function App() {
  return (
    <BrowserRouter>
      <main className="container">
        <nav>
          <Link to="/">List</Link> | <Link to="/history">History</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

