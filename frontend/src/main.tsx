import { Buffer } from 'buffer';
(window as unknown as Record<string, unknown>).Buffer = Buffer;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Landing from './Landing';
import './index.css';
import './ui.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>,
);