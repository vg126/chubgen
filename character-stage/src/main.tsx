import React from 'react';
import ReactDOM from 'react-dom/client';
import Stage from './Stage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {Stage.render()}
  </React.StrictMode>
);