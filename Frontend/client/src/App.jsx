import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link, Route, Router, Routes } from 'react-router-dom'
import Home from './Component/Home'
import About from './Component/About'
import Contact from './Component/Contact'

function App() {

  return (
    <>
      <nav className="bg-gray-800 p-4">
        <ul className="flex space-x-6 text-white">
          <li>
            <Link to="/" className="hover:text-blue-300">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-blue-300">About</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-300">Contact</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

    </>
  )
}

export default App
