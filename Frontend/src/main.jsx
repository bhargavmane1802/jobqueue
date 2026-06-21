import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16162a',
            color: '#f0f0fa',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22d3a5', secondary: '#16162a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#16162a' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
