import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // crie depois para estilos globais

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
