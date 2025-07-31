import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stage } from './Stage';
import type { InitialData } from "@chub-ai/stages-ts";

// Create a mock InitialData for local testing
const mockInitialData: InitialData<any, any, any, any> = {
  characters: {},
  users: {},
  config: {},
  messageState: null,
  environment: 'development',
  initState: null,
  chatState: null,
  token: "",
  id: 0,
  userId: ""
};

// Instantiate the Stage class for local testing
const stageInstance = new Stage(mockInitialData);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {stageInstance.render()}
  </React.StrictMode>
);
