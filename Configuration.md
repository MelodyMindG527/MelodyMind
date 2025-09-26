## Configuration

This project uses environment variables to configure API endpoints and behavior across environments.

### Environments
- Development: used locally with the default CRA behavior
- Staging: pre-production testing environment
- Production: live environment

### Environment Variables
Use the following variables:

```
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_ENV=development
```

Only variables prefixed with `REACT_APP_` are exposed to the browser.

### Files
Create these files in `frontend/` (not committed):

- `.env` or `.env.development`
- `.env.staging`
- `.env.production`

Example contents:

```
# .env.development
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_ENV=development

# .env.staging
REACT_APP_API_BASE=https://staging.api.melodymind.com
REACT_APP_ENV=staging

# .env.production
REACT_APP_API_BASE=https://api.melodymind.com
REACT_APP_ENV=production
```

### Scripts
From `frontend/`, use:

```
npm run start           # development
npm run start:staging   # staging with .env.staging
npm run start:production# production with .env.production

npm run build           # production build (uses .env.production by default)
npm run build:staging   # staging build
npm run build:production# explicit production build
```

Staging/production scripts require `env-cmd` and the corresponding `.env.*` files to exist.

