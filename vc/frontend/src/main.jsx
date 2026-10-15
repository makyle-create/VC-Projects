import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './Toast';
import './index.css';

// apply saved theme before first paint
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;

ReactDOM.createRoot(document.getElementById('root')).render(
   <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></BrowserRouter>
);