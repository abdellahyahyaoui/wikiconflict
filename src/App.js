import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CountryLayout from "./layout/CountryLayout"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/country/:code" element={<CountryLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
