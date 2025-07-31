import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stage } from './Stage';
import { ReactRunner } from '@chub-ai/stages-ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ReactRunner factory={(data) => new Stage(data)} />
);
