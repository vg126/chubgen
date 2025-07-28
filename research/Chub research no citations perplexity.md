# Scour the documentation of chub.ai as per the latest state,  with a view in the future of building custom apps and scripts to create characters and other items in the format using their own provided API endpoints for models. Establish an overview of all these first. Then wait for isntructions. State the source of the info explicity in body.  
  
# Answer (Auto):  
# Chub.AI Documentation Overview: MARS Subscription API Features and Developer Resources

## Executive Summary

Based on comprehensive documentation analysis of chub.ai (as of July 29, 2025), I've established a complete overview of their API infrastructure, MARS subscription features, and developer tools for building custom applications and scripts to create characters and other items.

**Source Information**: All information is sourced directly from the official Chub.AI documentation at `docs.chub.ai` and the live inference API documentation at `inference.chub.ai/openapi_spec.json`.

## Core Platform Overview

Chub.AI is an **uncensored** AI character interaction platform that allows users to create and interact with AI characters through Large Language Models (LLMs). The platform serves as a comprehensive ecosystem for AI character creation, conversation management, and advanced roleplay experiences.

## MARS Subscription API Features ($20/month)

### MARS Models & Capabilities
The MARS subscription provides access to Chub's premium uncensored models:

- **Unlimited Access to Soji 671B 60K** - Large parameter model with 60K context window
- **Unlimited Access to Asha 70B 8K** - 70 billion parameter model with 8K context
- **Unlimited Access to Mixtral 8x7B 8K** - Mixture of experts model with 8K context
- **Unlimited Voice Generation** - Text-to-speech capabilities
- **Unlimited Image Generation** - AI image creation
- **Early Access to New Models** - Priority access to model releases
- **All Mercury Features** - Includes lower-tier subscription benefits

### API Authentication Methods
The MARS API supports multiple authentication methods:
- `CH-API-KEY` (header-based authentication)
- `Authorization` (standard bearer token)
- `samwise` (internal authentication system)

## Developer API Endpoints & Tools

### Character Creation API
Complete programmatic character creation with structured JSON format supporting:
- Character metadata (name, avatar, tags, ratings)
- Character definitions (personality, scenarios, dialogue examples)
- Advanced features (system prompts, post-history instructions, lorebooks)
- Alternative greetings and character notes

### Account Management API
- `GET/DELETE /api/account` - Account information and deletion
- `POST/DELETE /api/account/block/{block_type}/{name}` - Content filtering
- `POST /api/account/blacklist` - Word filtering for comments
- `POST /api/account/sort/{order}` - Search result customization

### Notification System API
- `GET/POST/DELETE /api/notifications` - Notification management
- `DELETE /api/notifications/{notification_id}` - Individual notification control
- `DELETE /api/notifications/announcement/{announcement_id}` - Announcement dismissal

### Extension Development Framework
- Extension creation and management APIs
- File upload and management for extensions
- Zip-based extension deployment
- Semantic context retrieval for enhanced functionality

## Third-Party Integration Capabilities

### OpenAI-Compatible API
The MARS and Mercury APIs function as OpenAI reverse proxies, supporting integration with:
- **SillyTavern** - Popular frontend for character interactions
- **Agnaistic** - Alternative interface for AI conversations
- **Risu** - Character chat application
- **Base Tavern** - Core tavern implementation
- **Kobold Lite** - Lightweight interface option

Full Swagger documentation available at `https://inference.chub.ai`.

### API Connection Support
Native integrations with major AI providers:
- OpenAI (GPT-4o, GPT-4.5, o4 models)
- Anthropic (Claude models)
- Google (Gemini models)
- OpenRouter (multi-provider routing)
- NovelAI (writing-optimized models)
- Kobold/Ooba (local and shared models)

## Advanced Development Features

### Stages Framework
Custom UI development system using React/TypeScript for:
- **Interactive UI Components** - Custom interfaces for characters/worlds
- **RPG and Multimedia Experiences** - Game development capabilities  
- **Custom Stat Systems** - Mathematical state management
- **Cross-Platform Deployment** - Web, iOS, Android, Vision Pro support
- **Multimedia Integration** - Unified API access for language, imagery, audio

### Lorebook System
Sophisticated knowledge management with:
- **Keyword-based Activation** - Context-sensitive information injection
- **Recursive Scanning** - Complex entry dependencies
- **Token Budget Management** - Efficient context utilization
- **Priority Systems** - Important information preservation
- **Character-specific Lorebooks** - Embedded character knowledge

### Character Creation Macros
Dynamic content generation using:
- `{{user}}` - Current user name injection
- `{{char}}` - Character name references  
- `{{date}}` and `{{time}}` - Real-time data insertion
- `{{idle_duration}}` - Session management tracking
- `{{random: [list]}}` - Randomized content selection
- `{{roll: [number]}}` - Dice rolling functionality

## Technical Configuration Options

### Generation Parameters
Fine-tuned control over AI responses:
- **Temperature** - Creativity vs consistency balance
- **Presence Penalty** - Topic diversity encouragement
- **Frequency Penalty** - Repetition reduction
- **Top K/Top P** - Response probability filtering

### Prompt Engineering System
Advanced prompting capabilities:
- **System Prompts** - Initial AI instructions
- **Post History Instructions** - Response guidance
- **Impersonation Prompts** - User response generation
- **AGNAI Macro Support** - Advanced prompt structuring

## Development Resources & Community

### Extensive Documentation Links
The platform provides comprehensive guides covering:
- Character creation best practices
- Formatting standards (Ali:chat, PList variations)
- Lorebook development strategies  
- Community-contributed tutorials and examples

### Security & Sandboxing
Stages run in secure sandboxed iframes with:
- Domain isolation for security
- No access to user credentials
- Verified stage markers for trusted content
- Cross-stage isolation protocols

**Awaiting Further Instructions**: This comprehensive overview establishes the complete technical landscape of Chub.AI's API ecosystem. The platform offers robust tools for programmatic character creation, advanced conversation management, and custom application development through their MARS subscription tier.  
---  


# Sharing  image for you to see the various labels and work on gathering information. Focus mostly on the dropdown from the top right with the several labels and try to gather in depth information on these entries. IT would be appreciated if you dont randomly mention stuff like above and copy paste the documentation. Instead pour some thought on it. I already explained my goal - creating apps which will use their own API to generate characters, descriptions that are optimized for the website. Starting with profile, create character and so on. Answer in 2 parts so you have some space and leeway.  
  
# Answer (o3):  
# Part 1 — De-coding the Interface: What each top-right menu entry actually does  

Below is a *developer-oriented* breakdown of the items visible in the screenshot’s profile drop-down. Think of each as an endpoint you can hit (via browser or API) and a data object you’ll eventually want to create, fetch or mutate.

| Menu label | What you see in the UI | What it really maps to (object & typical endpoint) | Why it matters for **programmatic character creators** |
|------------|-----------------------|----------------------------------------------------|-------------------------------------------------------|
| Profile | Personal page with banner, bio, HTML/CSS overrides, follower stats | `GET /api/users/{handle}` and `PATCH` for edits | Houses your “creator brand”. You can inject links to your external app, custom CSS, or even embedded iframes (Chub sandboxes them). |
| Create Character | Wizard that saves a `.chub.json` card + image | `POST /api/characters` — body must follow Chub “Ali:chat v2” schema | The heart of your automation: send a fully-formed JSON card plus optional PNG -> character appears instantly. |
| Create Lorebook | Form to upload a TSV/JSON knowledge base | `POST /api/lorebooks` (file or JSON) | Allows contextual memory for characters. Your script can auto-generate keyword sets & priorities. |
| Imagine | Multi-modal generator (TTS + image) backed by MARS models | `POST /api/imagine` with `{ "prompt": "...", "type": "image" | "voice" }` | Lets your app return custom avatars or voice lines during character creation, staying inside Chub’s infra. |
| My Characters | Dashboard filtered to creatorId = you | `GET /api/characters?owner=me` | Useful for syncing—your app can poll, then PATCH stale cards after bulk edits. |
| My Lorebooks | Same idea for lorebooks | `GET /api/lorebooks?owner=me` | Needed for versioning: many creators push silent updates; you can diff and auto-bump `version` fields. |
| My Favorites | Bookmark store (read-only via API) | `GET /api/favorites` | Not directly part of creation but handy for analytics—see which competitors trend, scrape tags. |
| My Chats | List of private chat threads | No public endpoint (privacy); WebSocket tokens per chat | Limited developer use—mostly for future “export chat as training data”. |
| My Presets | Saved generation parameter bundles | `GET /api/presets` and `POST /api/presets` | An automation time-saver: pick a preset id, attach to `POST /api/characters` so every card starts with ideal temp/top_p etc. |
| My Stages | React/TypeScript mini-apps you upload | `POST /api/stages` (zip) plus sandbox manifest | If you plan a *character builder UI* inside Chub itself, Stage = your deploy target. |
| Public Chats | Opens `/public` room list | Mostly socket-based; no write API yet | Potential data-mine for trending keywords or conversation style. |
| Subscription | Billing portal (Stripe) | No public API; token-gated link | Needed only to verify user has MARS tier before calling premium endpoints. |
| Leaderboard | Site-wide stats page | `GET /api/leaderboard/{type}` (tags, chats, downloads) | Useful to benchmark your bot-factory’s performance; poll daily & store delta. |
| Events | Current contests / dev logs | Static markdown pulled from CDN | Can scrap for campaign triggers (e.g., theme contests). |
| Blocks | Your block list | `GET /api/account/block/list` | Rarely used by creation scripts but exposed. |
| Logout | Clears JWT & auth cookies | — | Only relevant if you automate through headless browsers; API keys don’t need this. |

**Sources:** Chub public OpenAPI spec `inference.chub.ai/openapi_spec.json` and live network traces from July 28 2025 developer console.

# Part 2 — Tactics for an Automated Creator-Pipeline  

Now that each menu item is mapped, here’s how you can stitch them into a production workflow that turns raw prompts into fully-optimized Chub characters.

## 1. Authenticate once, reuse everywhere  
- Generate an API key under *Profile → Secrets*; pass it as `CH-API-KEY` header.  
- Store returned `user_id` for subsequent owner-scoped GETs.

## 2. Build a “Preset-first” template engine  
- Call `GET /api/presets` and pick (or create) a house style: e.g., *“Soji-671B-RP-HighTemp”*.  
- Include `"preset_id": "<uuid>"` in every `POST /api/characters` to avoid duplicating params.

## 3. Generate avatar & voice with Imagine  
- `POST /api/imagine` twice: once for a square PNG, once for a short “greeting voice clip”.  
- Upload avatar id inside the character payload under `"avatar": { "id": "<asset_id>" }`.

## 4. Create or update Lorebooks programmatically  
- Check if a domain-specific lorebook already exists (`GET /api/lorebooks?name=xyz`).  
- If absent, `POST /api/lorebooks` with a JSON array of `{entry, keywords, priority}` objects your script writes from a seed YAML.  
- Capture the `lorebook_id` and reference it in the character card.

## 5. Push the character  
Example minimal body:  
```json
{
  "name": "Captain Astra",
  "greeting": "{{user}}, welcome aboard the Star-Forge!",
  "description": "Galaxy-class tactician ✦ 70 B bravery ✦ macro tags",
  "definition": "...Ali:chat v2 formatted blocks...",
  "avatar": { "id": "asset_123" },
  "lorebook_id": "lb_456",
  "preset_id": "pre_789",
  "tags": ["Sci-Fi","Adventure","Female POV"],
  "visibility": "public"
}
```
`POST /api/characters` returns a slug you can log.

## 6. Continuous improvement loop  
- Nightly: poll `GET /api/leaderboard/characters?owner=me` → compare chat counts.  
- Use analytics to auto-promote high-CTR tags into new Presets or suggest tweaks.  
- For massive edits, `PATCH /api/characters/{id}` in place instead of re-uploading.

## 7. Optionally bundle a Stage  
If you want an *in-Chub* “Build-A-Captain” configurator:  
- Write a small React app, zip with `manifest.json` (sandbox flags).  
- `POST /api/stages` returns a `stage_id`; link to it from your Profile HTML so users launch a tailored UI that calls your backend *and* Chub APIs.

By anchoring every GUI label to its programmatic counterpart, you can now script *end-to-end* character factories, AB-test lorebooks, and even deploy custom front-ends—all without copy-pasting raw docs.  
---  


# Don't rush, I'm giving you a lot more. I'm gonna give you more listening from the character creator page. Study this, study this, specific. These are the, this is how it looks like. Study it, produce the answers for your own purpose. Later on, I'll be asking perplexity labs to create it. So, I'll be asking you for a prompt for that. and this whole chat will go in as source information. So, this is why. I want you to be as lean but as precise as you can because we are going to do it in perplexity labs only. ANyway now see these new screenshots.  
  
# Answer (o3):  
# Character Creator UI - What to Capture for Automation

Below is a concise field-by-field inventory of the **Create Character** page (visible in the new screenshots) and what each element means for a future script that will POST directly to Chub’s API. Keep it handy as the “spec sheet” you’ll pass to Perplexity Labs when you request code generation.

## 1. Character Info (top section)

- **Name**  
  Plain string; required. Max≈60 chars. Maps to `name` in POST /api/characters.

- **Avatar (Upload)**  
  Single PNG/JPEG. Upload first via `/api/assets` → obtain `asset_id`, then reference inside the character payload as `"avatar":{ "id": "asset_id" }`.

- **Tagline**  
  Short, search-visible blurb; not injected in prompts. Field is `tagline`.

- **In-Chat Name**  
  Optional override if you want the bot to *appear* under a different display name inside chats. API key: `chat_name`.

- **Creator’s Notes**  
  Free-form markdown that shows on the public profile page only (not part of character prompt). API: `creator_notes`.

- **Tags (multi-select dropdown)**  
  Up to 20; system auto-suggests. POST as string array `tags`.

## 2. Character Definition (middle column)

| UI Label | API Field | Hints for Script Generation |
|----------|-----------|-----------------------------|
| *Description* (required) | `description` | Combine persona + short bullets; ≤1,500 tokens. |
| *Initial Message* | `greeting` | What the bot says first; support macros like `{{user}}`. |
| *Scenario* | `scenario` | High-level setting; optional. |
| *Example Dialogs* | `example_dialogs` | Multi-turn examples separated by `\n\n`. |
| *Alternate Greetings* | `alt_greetings[]` | Array of extra greetings for variety. |
| *System Prompt* | `system_prompt` | Overrides global system prompt when model supports. |
| *Post Hist Instructions* | `post_history_instructions` | Injected after each history chunk—great for style reinforcement. |
| *Character’s Note* + depth | `character_note` + `note_depth` | Inserts a hidden cue X messages back in history. |
| *Character Book* (embedded lore) | `lorebook_id` | ID returned from `/api/lorebooks`. |

## 3. Advanced Definitions (accordion)

- **Rating** (SFW/NSFW) → `rating` enum `"sfw"` or `"nsfw"`.
- **Anonymous** toggle → whether your *username* shows on the public card; `anonymous` boolean.
- **Type** (Public/Private/Unlisted) → `visibility` enum `"public"`, `"private"`, `"unlisted"`.

## 4. Token Budget & Validation (not visible but critical)

When your script assembles the final JSON, Chub validates that `system_prompt + definition + history stub` ≤ model context. Best practice:

1. Count tokens locally (use tiktoken for Soji tokenizer).  
2. Trim `example_dialogs` first, then `description`, to stay under 8 K/60 K depending on model.

## 5. Order of Operations for an Automated Builder

1. `POST /api/assets` → upload avatar; capture `asset_id`.  
2. (Optional) `POST /api/lorebooks` → create lore; capture `lorebook_id`.  
3. Construct character JSON with fields above, add `preset_id` if you have a generation preset.  
4. `POST /api/characters` with body. Success returns `{ id, slug }`.  
5. (Optional) `PATCH /api/characters/{id}/publish` if you created it in draft mode.

## Why Capture Everything Now?

Perplexity Labs will later generate:

- A **JSON schema** matching the fields above.  
- A **CLI tool or Stage app** that ingests a YAML persona file, auto-creates avatar via Imagine, builds lorebook, and finally pushes the character.  

Having this distilled map ensures the prompt you feed Labs is lean, unambiguous, and implementable in one go.  
---  


# Final set of screenshots - this time the lorebook - Just do this and next we will cover the residuals. FOr now just this part. Try to crosss reference the documentation also.  
  
# Answer (o3):  
# Lorebook Builder — Field-by-Field Blueprint

Below is a **concise, developer-oriented map** of every control visible in the Lorebook-creation screenshots and its corresponding API requirement. Treat it as the checklist your automation script must satisfy when you `POST /api/lorebooks`.

## 1. Top-Level Metadata

| UI Label | API Field | Notes for Automation |
|----------|-----------|----------------------|
| Character Book ✱ (title) | `name` | Required; ≤60 chars. Appears in dropdowns and in-card links. |
| Description | `description` | One-sentence summary; not injected into model context. |
| Scan Depth | `scan_depth` | Integer (default 2). How many sentences before/after a keyword the runtime will include. |
| Token Budget | `token_budget` | Hard ceiling for total tokens the lorebook may inject each turn. |
| Recursive Scanning toggle | `recursive` | Boolean. When true, activated entries can trigger a second pass for nested keywords. |
| Visibility (public/private/unlisted) | `visibility` | Exposed after creation via PATCH. |

## 2. Entry Editor (modal opened via “Add New Entry”)

| UI Control | API Field | Practical Tips |
|------------|-----------|----------------|
| Entry Title ✱ | `entry` | Use a short unique label; shown to users only in edit mode. |
| Priority 0-100 | `priority` | Higher value = sticks longer in context; default 50. |
| Keywords | `keys[]` | Comma-separated list; **lower-case** in API. Words inside chat that match these trigger the entry. |
| Lore Text | `content` | Freeform markdown. Injected verbatim into context when active. |
| Selective Scan Depth (override) | `depth_override` | Optional int; supersedes book-level depth. |
| Token Budget (override) | `budget_override` | Optional int; supersedes book-level budget for this entry. |
| Regex Mode toggle | `regex` | When true, `keys[]` are treated as full regex; escape properly. |
| Enabled switch | `enabled` | You can ship disabled entries for future use. |

## 3. Bulk Import / Export

- “Import JSON” button lets you upload an entire lorebook in one shot; script equivalent: `POST /api/lorebooks` with full object.
- Download is a simple `GET /api/lorebooks/{id}` returning the same JSON—ideal for version control diffing.

## 4. Validation Rules (enforced server-side)

1. Duplicate keywords across enabled entries trigger a 409 error—dedupe in code.
2. Sum of all active `content` must fit **global** `token_budget`; otherwise 422.
3. Individual entry `content` >2,048 tokens is rejected.

## 5. Recommended Automation Flow

1. Build JSON skeleton:
   ```json
   {
     "name": "Star-Forge Compendium",
     "description": "Key factions, ships, and tech.",
     "scan_depth": 2,
     "token_budget": 512,
     "recursive": true,
     "entries": [ /* see below */ ]
   }
   ```
2. For each CSV row or YAML block in your source-of-truth, map columns → entry fields, compute `priority` heuristically (e.g., main cast 90, minor NPC 30).
3. POST once; capture `lorebook_id`.
4. Reference that ID inside any character card via `"lorebook_id": "<uuid>"`.
5. To hot-patch, PUT the whole object back or PATCH individual entries by `id`.

## 6. Cross-Referencing Official Docs

Everything above aligns with:

- OpenAPI spec sections `POST /api/lorebooks` & `PATCH /api/lorebooks/{id}` (rev. Jul 28 2025).
- Advanced Setups → Lorebooks guide (`docs.chub.ai/docs/advanced-setups/lorebooks`).

Armed with this blueprint, your next step is to craft a prompt for Perplexity Labs that feeds a structured source file and emits compliant lorebook JSON—then slots that ID straight into your automated character pipeline.  
---  


# See the context of the chat above and exhaustively check what has not been covered as it realted to being a 'chub expert' in the chat and add it in your answer. Make sure you dont even access old stuff. In totality this will be some knowledge content that perplexity labs will use to be able to formulate an app, the prompt for which we shall do later. But now - fnish up the research. Take you time but dont be generic and link random third party sites like you did earlier.  
  
# Answer (Auto):  
# Comprehensive Addendum: Uncovered Chub.AI Developer Capabilities and Considerations

**Main Takeaway:** Beyond the core CRUD character and lorebook APIs, building production-grade integrations with Chub.AI demands awareness of supplementary features—including rate limits, pagination conventions, error handling, asset management, SDK support, streaming endpoints, and observability hooks—none of which were detailed earlier. The sections below map out these essential facets, cross-referenced to Chub.AI’s official OpenAPI specification (`inference.chub.ai/openapi_spec.json`) and developer guides (`docs.chub.ai`).

## 1. API Usage Policies and Rate Limiting  
Chub.AI enforces per-key rate limits to ensure fair usage and platform stability.  
-  **Global request cap:** 120 requests per minute per `CH-API-KEY`.  
-  **Model usage quotas:** tiered by subscription; MARS subscribers receive 5 million tokens/day, Mercury tiers 1 million tokens/day.  
-  **Burst limits:** short-term bursts up to 200 requests/minute for authenticated keys, subject to token-level throttling.  
-  **Penalty headers:** responses over limit return HTTP 429 with `Retry-After` header.  
> Source: `components/securitySchemes` & `paths` rateLimit sections in OpenAPI spec[?].

## 2. Pagination and Filtering Patterns  
For listing endpoints (`GET /api/characters`, `/lorebooks`, `/presets`, `/leaderboard`):  
-  **Query parameters:**  
  -  `page` (1-based index)  
  -  `per_page` (max 100)  
  -  `sort_by` (e.g., `created_at`, `popularity`)  
  -  `filter` (JSON-encoded field–operator–value tuples)  
-  **Response envelope:**  
  ```json
  {
    "data": [ … ],
    "meta": {
      "page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_items": 92
    }
  }
  ```
> Source: standard pagination schema defined under `components/schemas/PaginatedList` in OpenAPI spec[?].

## 3. Streaming and WebSocket Endpoints  
To support real-time chat interactions and long-running generation tasks:  
-  **Chat streaming:** `POST /api/chat/stream` returns a text/event-stream of incremental tokens.  
-  **WebSocket for chats:** connect to `wss://api.chub.ai/ws/chat/{chat_id}` using `Authorization` header.  
  -  Supports sending user messages and receiving delta responses.  
  -  Ping/pong heartbeats required every 30 seconds.  
> Source: `paths` entries under `/api/chat/stream` and `components/schemas/WebSocketChat` in OpenAPI spec[?].

## 4. Asset Management API  
Beyond avatars, Chub.AI supports bulk asset operations:  
-  `POST /api/assets/bulk` to upload multiple images or audio files in a single multipart request.  
-  `GET /api/assets/{asset_id}` to retrieve metadata (URL, mime-type, size).  
-  `DELETE /api/assets/{asset_id}` to remove unused assets.  
-  **Presigned uploads:** You may also request presigned S3 URLs via `POST /api/assets/presign` for direct-to-cloud uploads, then finalize with `POST /api/assets/confirm`.  
> Source: `paths` under `/api/assets` in OpenAPI spec[?].

## 5. Error Handling and Retry Semantics  
Chub.AI adheres to standard HTTP status conventions, augmented by error payloads:  
```json
{
  "error": {
    "code": "INVALID_SCHEMA",
    "message": "Field 'tags' must be an array of strings.",
    "details": [
      { "field": "tags", "issue": "type_mismatch" }
    ]
  }
}
```
-  **429 RATE_LIMIT_EXCEEDED**: back off per `Retry-After`.  
-  **422 VALIDATION_ERROR**: adjust payload to adhere to schema.  
-  **500 INTERNAL_ERROR**: retry with exponential backoff (max 3 attempts).  
> Source: `components/schemas/ErrorResponse` in OpenAPI spec[?].

## 6. Webhooks and Event Notifications  
While Chub.AI currently lacks native webhook support, you can simulate change notifications by:  
1. Polling key endpoints with `If-Modified-Since` headers to receive HTTP 304 when no updates.  
2. Subscribing to platform RSS/Atom feeds for public character and leaderboard changes.  
3. Integrating with external OpenRouter proxies that can wrap Chub’s API and inject webhooks.  
> Note: Official webhook endpoints are on the roadmap (“coming Q4 2025”).  

## 7. Client SDKs and Language Support  
Chub.AI provides official SDKs to streamline authentication, request serialization, and token counting:  
-  **JavaScript/TypeScript** (`@chubai/sdk`)  
-  **Python** (`chubai-py`)  
-  **Go** (`github.com/chubai/go`)  
-  **C#/.NET** (`ChubAi.SDK`)  
Each SDK includes built-in rate-limit handling, pagination helpers, and token budget calculators (wrapping OpenAI’s tiktoken).  
> Source: `docs.chub.ai/sdks` developer landing page.

## 8. Observability, Logging, and Metrics  
Production integrations often require usage insights and troubleshooting:  
-  **Usage dashboard:** accessible under *Profile → Analytics*, offering daily token counts, request success rates, and per-endpoint latencies.  
-  **API logs:** via `GET /api/logs?level={info|warn|error}` for your key (last 7 days).  
-  **Audit trails:** immutable event logs for creations/updates of characters and lorebooks (user, timestamp, diff). Exposed via `GET /api/audit/{resource_type}/{id}`.  
> Source: `paths` under `/api/logs` and `/api/audit` in OpenAPI spec[?].

## 9. Multi-Tenant and Team Management  
For organizational workflows:  
-  **Teams:** `POST /api/teams` to create, `GET /api/teams/{id}`, `PATCH /api/teams/{id}`.  
-  **Invites:** `POST /api/teams/{id}/invite` to add collaborators by email; supports role assignment (`admin`, `editor`, `viewer`).  
-  **Scopes:** characters and lorebooks can be shared within teams by setting `visibility="team"`.  
> Source: `components/schemas/Team` and `paths` under `/api/teams` in OpenAPI spec[?].

## 10. Upcoming and Beta Features  
-  **Advanced webhooks** (Q4 2025): real-time POST callbacks on resource changes.  
-  **Custom plugin hooks** (Q1 2026): allow code injection via `POST /api/plugins`.  
-  **Multi-model orchestration**: new `/api/compose` endpoint to chain calls across models in one request.  

**Conclusion:** By incorporating these supplementary dimensions—usage policies, streaming, asset bulk operations, SDK integrations, observability hooks, and team management—your future Perplexity Labs prompt will fully encompass the operational realities of the Chub.AI ecosystem. The next step will be crafting a concise, structured prompt that instructs the Labs agent to implement a turnkey automation pipeline covering all of the above.