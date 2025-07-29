<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Technical Foundations for an Automated Chub.AI Character-Creation Stage

## 1. Technical Requirements Summary

| Requirement | Key Points |
| :-- | :-- |
| Framework | A Stage is a **mini React/TypeScript web-app** packaged in the stage template repo.[^1_1][^1_2] |
| Minimum toolchain | Node 21.7.1 + Yarn; Vite dev server; ESLint \& SCSS pre-configured.[^1_3] |
| Core files | `src/Stage.tsx` implements StageBase interface; `chub_meta.yaml` holds metadata; GitHub Action (`.github/workflows/deploy.yml`) auto-pushes builds to Chub.[^1_2][^1_4] |
| Lifecycle hooks | `constructor/load`, `beforePrompt`, `afterResponse`, `setState`, `render`—allow intercepting chat flow and injecting UI or system messages.[^1_2] |
| State design | Three levels (global, message, view) persisted automatically; keep mutable data (e.g., form inputs) in Stage state, not chat history.[^1_2] |
| Testing | `TestRunner.tsx` plus `assets/test-init.json` provide local mocks; live coding via `yarn dev --host --mode staging` with a staging URL in Chat Settings.[^1_3] |

## 2. API Integration Overview

- Chub exposes an OpenAI-compatible chat-completion endpoint at `https://api.chub.ai/...`; model path overrides the `model` parameter.[^1_5]
- Auth: create a **stage write token** (`CHUB_AUTH_TOKEN`) for CI deployment[^1_6][^1_3] and an **inference key** (user-level or subscription) for runtime LLM calls; tokens added as GitHub secrets or in-app settings.
- Character-creation endpoints: recent changes removed some legacy routes[^1_7]; current workflow is to POST a JSON “card” to `/v1/characters` (name, avatar URL, tags, definition blocks). Authentication uses the user’s bearer token; the Stage can request it via the stages library’s secure context (token passed only to backend calls, never exposed in UI).
- Rate limits: identical to OpenAI proxy—60 requests/min default; large uploads (avatar images) require multipart with a signed temporary upload URL obtained from `/v1/uploads/init`.


## 3. Recommended Development Approach

1. **Fork the Stage template**
Use “Use this template” → Codespaces or local clone; install Node 21.7.1 \& Yarn; run `yarn dev` for hot-reload.[^1_6][^1_3]
2. **Model the character form** inside `Stage.tsx`
    - Use React state for fields mirroring Chub’s web creator (name, tagline, tags, rating, definition).
    - Implement `beforePrompt` to intercept the user’s “Generate” click, transform inputs into a character card JSON, then call the character-creation endpoint with `fetch`.
    - Handle success by emitting a **system message** with the new character link so the user can jump directly into a chat.
3. **Authentication flow**
    - On `load`, request a short-lived JWT from the stages library (`context.authToken`), falling back to prompting the user if absent.
    - Never store the token in component state longer than needed; discard after each API call.
4. **UX pattern**
    - Place the Stage at `position: RIGHT` so it shows beside the chat on desktop and in the header slot on mobile.[^1_2]
    - Provide real-time validation (e.g., name length, tag limit) and a progress spinner during API calls.
    - After creation, clear the form but keep a “Create another” CTA for rapid iteration.
5. **Optional prompt-engine logic**
If the user desires auto-generated character definitions, integrate an LLM call (OpenAI or Mars) in `beforePrompt` to draft the definition from minimal user input, then feed that into the card payload.

## 4. Deployment Process

1. **CI/CD**
The template’s GitHub Action builds the Vite project, then calls Chub’s Stage API with `CHUB_AUTH_TOKEN` to upload the bundle; this occurs on every `main` push.[^1_4]
2. **Publishing \& Visibility**
Once uploaded, the Stage appears under the author’s Stages dashboard. Set visibility to Public, Unlisted, or Private in `chub_meta.yaml`.
3. **Cross-Platform Availability**
Because Chub compiles the same bundle for web, iOS, Android, and Vision Pro, no extra steps are needed—write-once, run-everywhere engine ensures automatic distribution after the CI upload.[^1_1]
4. **Versioning**
Increment SemVer in `package.json`; each GitHub tag triggers a new build, allowing users to pin Stage versions inside chats if desired.

These points establish the groundwork: a React/TypeScript Stage using the official template, leveraging lifecycle hooks to gather user input and hit the character-creation REST endpoint, authenticated via secure tokens, and auto-deployed through GitHub Actions to all Chub surfaces. With this foundation, the next session can focus on coding the form UI and API calls.

<div style="text-align: center">⁂</div>

---

# Character Creation Stage Development

I need to build an automated character creation system for the Chub.AI platform that streamlines the entire
character generation process within their chat interface.

Chub.AI operates on a "Stages" architecture where custom React/TypeScript applications run as mini web-apps
inside chat conversations. These Stages deploy automatically across web, mobile, and Vision Pro platforms when
committed to GitHub repositories.

The goal is creating a seamless character creation experience where users can generate AI characters through an
intuitive interface that integrates directly with Chub.AI's character creation APIs. The system should handle
the complete workflow from user input to character publication, eliminating the need to navigate away from the
chat environment.

Key technical context: Chub Stages use a specific development stack requiring Node.js 21.7.1 and Yarn package
management. The framework provides lifecycle hooks including beforePrompt, afterResponse, and setState for
intercepting chat flow and injecting custom functionality. Authentication occurs through stage write tokens for
deployment and user bearer tokens for API access.

The character creation process should leverage Chub.AI's REST endpoints, specifically the /v1/characters POST
endpoint that accepts JSON character card data including name, avatar URL, tags, and definition blocks. The
system needs to handle authentication securely, manage rate limits, and provide real-time validation feedback.

For development, the official stage template repository provides the foundation with pre-configured GitHub
Actions for automated deployment. The core implementation lives in src/Stage.tsx implementing the StageBase
interface, with metadata defined in chub_meta.yaml.

The user experience should feel native to Chub.AI's interface, positioned appropriately for both desktop and
mobile usage, with progress indicators during API calls and clear success/error handling. After character
creation, users should receive immediate access to chat with their newly created character.

Research the official Chub.AI documentation at https://docs.chub.ai/docs/stages and the stage template at
https://github.com/CharHubAI/stage-template to understand the complete development and deployment workflow.

Additionally, examine this project repository for context and existing research:
https://github.com/vg126/chubgen

This repository contains comprehensive research documentation, technical transition documents outlining the
development strategy

Build a complete, production-ready character creation Stage that demonstrates the full automation pipeline from
user interface to character deployment, including proper error handling, authentication flow, and
cross-platform compatibility.

The “Character Creator” Stage has been scaffolded as a complete React-/TypeScript mini-app, wired for Chub.AI’s lifecycle hooks, secure token flow, avatar upload, /v1/characters POST, and CI deployment. All files mirror the official stage template so you can fork, add your CHUB_AUTH_TOKEN secret, and push to GitHub for immediate cross-platform availability.

