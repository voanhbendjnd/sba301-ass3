/**
 * Author: Võ Anh Ben - CE190709
 * Điểm khởi chạy của ứng dụng React (React Entry Point)
 * 
 * Luồng hoạt động:
 * 1. Nạp CSS Bootstrap 5 và stylesheet tùy biến styles.css
 * 2. Tìm phần tử DOM '#root' trong index.html
 * 3. Khởi tạo React Root và gắn component gốc <App /> trong chế độ StrictMode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
