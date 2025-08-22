import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link, Route, Router, Routes } from 'react-router-dom'
import Home from './Component/Home'
import Contact from './Component/Contact'
import Payment from './Component/Payment'

function App() {

  return (
    <>
      <nav className="bg-gray-800 p-4">
        <ul className="flex space-x-6 text-white">
          <li>
            <Link to="/" className="hover:text-blue-300">Home</Link>
          </li>
          <li>
            <Link to="/payment" className="hover:text-blue-300">Payment</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-300">Contact</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

    </>
  )
}

export default App
