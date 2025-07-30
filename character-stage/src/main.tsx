import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stage } from './Stage';

// Create a mock InitialData for local testing
const mockInitialData = {
  characters: {},
  users: {},
  config: {},
  messageState: null,
  environment: 'development',
  initState: null,
  chatState: null,
};

// Instantiate the Stage class for local testing
const stageInstance = new Stage(mockInitialData);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {stageInstance.render()}
  </React.StrictMode>
);