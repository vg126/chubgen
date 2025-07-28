# TENTATIVE Chub.AI Research - UNVERIFIED

**⚠️ WARNING: This content is from Perplexity AI and may contain inaccuracies. Treat as preliminary research only.**

## Project Objective
Create automated apps/scripts using Chub.AI's API to generate optimized characters, descriptions, and lorebooks for the platform. Focus on streamlining the character creation process through API integration rather than manual UI interaction.

## Key Technical Requirements (UNVERIFIED)

### Authentication & API Access
- **MARS Subscription Required** ($20/month) for unlimited access to premium models
- **API Key Authentication**: `CH-API-KEY` header-based authentication
- **Rate Limits**: 120 requests/minute, 5M tokens/day for MARS tier

### Core API Endpoints for Automation (NEEDS VERIFICATION)

#### Character Creation Pipeline
1. `POST /api/assets` - Upload avatars (capture asset_id)
2. `POST /api/lorebooks` - Create knowledge bases (capture lorebook_id)  
3. `POST /api/characters` - Create character with full JSON payload
4. `POST /api/imagine` - Generate avatars/voice using MARS models

#### Essential Character Fields (from UI analysis)
```json
{
  "name": "string (required, ≤60 chars)",
  "greeting": "string (supports {{user}} macros)",
  "description": "string (≤1,500 tokens)",
  "definition": "Ali:chat v2 formatted blocks",
  "avatar": {"id": "asset_id"},
  "lorebook_id": "uuid",
  "preset_id": "uuid", 
  "tags": ["array", "of", "strings"],
  "visibility": "public|private|unlisted",
  "rating": "sfw|nsfw"
}
```

#### Lorebook Structure (UNVERIFIED)
```json
{
  "name": "string (≤60 chars)",
  "description": "summary string",
  "scan_depth": "integer (default 2)",
  "token_budget": "integer (hard ceiling)",
  "recursive": "boolean",
  "entries": [
    {
      "entry": "title string",
      "priority": "0-100 integer",
      "keys": ["keyword", "array"],
      "content": "markdown content",
      "enabled": "boolean"
    }
  ]
}
```

### Automation Workflow Strategy (THEORETICAL)
1. **Preset-first approach**: Create/reuse generation presets for consistent style
2. **Asset generation**: Use `/api/imagine` for avatars and voice clips
3. **Lorebook integration**: Auto-generate domain-specific knowledge bases
4. **Batch operations**: Leverage pagination and bulk endpoints
5. **Error handling**: Implement retry logic for rate limits and validation errors

### Development Considerations (UNVERIFIED)
- **Token counting**: Use tiktoken for accurate context budget management
- **Validation**: Server-side validation enforces schema compliance
- **Asset management**: Support for bulk uploads and presigned S3 URLs
- **Team collaboration**: Multi-tenant support for organizational workflows

## Project Structure
- Research phase: Document analysis and API mapping (TENTATIVE)
- Development phase: Perplexity Labs prompt creation (next)
- Implementation phase: Automated character factory deployment

## Source Material (UNVERIFIED)
All technical specifications claimed to be derived from:
- Official Chub.AI documentation: https://docs.chub.ai/docs
- Official Chub.AI OpenAPI spec (`inference.chub.ai/openapi_spec.json`)
- Developer documentation (`docs.chub.ai`)
- UI analysis from character creator and lorebook interfaces
- MARS subscription feature documentation

**⚠️ IMPORTANT: This research needs verification against actual platform documentation and testing before implementation.**