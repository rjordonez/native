// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import DashboardPage from './DashboardPage';
import './index.css'; // Ensure Tailwind CSS is properly set up

ReactDOM.render(
  <React.StrictMode>
    <DashboardPage />
  </React.StrictMode>,
  document.getElementById('root')
);
