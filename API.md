## API

### Base URL
The frontend reads the base URL from `REACT_APP_API_BASE`.

Code reference (frontend):

```
src/utils/api.ts
export const apiUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
```

Set the variable via environment files per `docs/Configuration.md`.

### Common endpoints (examples)
- `GET /health` — service health check
- `POST /auth/login` — authenticate and get token
- `GET /playlists/recommended` — recommended playlists for current mood
- `POST /mood/entries` — create a mood entry

Update this document as backend endpoints evolve.

