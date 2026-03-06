

## Plan: Add OpenClaw API Configuration to Sibe Settings UI

### What We Are Building
Users will configure their OpenClaw API endpoint and API key directly from the Settings page in the app. The credentials will be stored per-user in the `connected_agents` table (which already exists and supports API keys, endpoints, and per-user RLS). Edge functions will then read these credentials at runtime from the database instead of relying on environment secrets.

### Changes

**1. Settings Page (`src/pages/Settings.tsx`)**
- Add "OpenClaw" as an option in the AI Engine selector (alongside Lovable AI, OpenAI, etc.)
- When "OpenClaw" is selected, show two fields: **API Endpoint URL** and **API Key**
- On save, upsert a row into `connected_agents` with `platform: 'openclaw'`, storing the endpoint and API key
- On page load, fetch any existing OpenClaw agent config to pre-populate the fields
- The "Save AI Settings" button will actually persist to the database (currently it just shows a toast)

**2. Edge Functions (all OpenClaw-routed functions)**
- Update `sibe-chat`, `generate-insights`, `generate-forecast`, `generate-report`, `execute-workflow`, and `ai-meeting` edge functions to:
  - Accept a `user_id` in the request (from the auth token)
  - Query `connected_agents` for `platform = 'openclaw'` and that user's ID
  - Use the stored `api_endpoint` and `api_key_encrypted` to call the OpenClaw API
  - Fall back to the Lovable AI Gateway if no OpenClaw config is found

**3. No database migration needed** — the `connected_agents` table already has all required columns (`api_endpoint`, `api_key_encrypted`, `platform`, `user_id`) with proper RLS policies.

### Technical Details

- Credentials are stored in `connected_agents.api_key_encrypted` (text column). For production, true encryption should be added, but this matches the existing pattern used for all other agent connections.
- Edge functions will create a Supabase service-role client to read the user's OpenClaw config, since the user's JWT is already available from the authorization header.
- The UI will mask the API key with a show/hide toggle, consistent with the existing connection dashboard pattern.

