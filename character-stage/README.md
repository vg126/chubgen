# Character Stage

This directory contains a minimal example stage built with React. It demonstrates how a Chub.AI stage can provide a small character creation interface.

## Setup

```bash
yarn install
yarn dev
```

The `dev` script runs Vite for local development.

## Build and Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds the stage and commits the compiled assets when changes are pushed to `main`. The built files are served via GitHub Pages.

## Official Template Reference

See [`stage-template-reference`](../stage-template-reference) or the [official stage-template repository](https://github.com/CharHubAI/stage-template) for a full reference implementation.
