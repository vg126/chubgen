import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stage } from './Stage';
import { ReactRunner, type InitialData } from '@chub-ai/stages-ts';

// Check if we're in a Chub environment or static GitHub Pages
const isChubEnvironment = window.location.hostname !== 'vg126.github.io';

if (isChubEnvironment) {
  // Use ReactRunner for Chub deployment
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ReactRunner factory={(data) => new Stage(data)} />
  );
} else {
  // Use mock data for GitHub Pages demo
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
  
  const stageInstance = new Stage(mockInitialData);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {stageInstance.render()}
    </React.StrictMode>
  );
}
