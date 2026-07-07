# JW Courtship Advisory Website

This project is a static landing page with a Node.js backend for contact and profile submissions.

## Getting Started

1. Install Node.js (recommended version 18+).
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`

## Configuration

Use `.env` to configure the server and optional email notifications.

### Recommended environment variables

- `PORT` — server port
- `NODE_ENV` — production or development
- `CORS_ORIGIN` — allowed origin for browser requests
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `EMAIL_TO` — SMTP settings for notification emails

If email settings are not provided, submissions will still be stored locally in `submissions/`.

## Deployment

This backend can be deployed to any Node-capable host. Recommended platforms:

- Render
- Railway
- Heroku
- DigitalOcean App Platform

### Docker

Build and run with:

```bash
docker build -t jw-courtship-advisory .
docker run -p 3000:3000 --env-file .env jw-courtship-advisory
```

## Production Readiness

This version includes:

- security headers via `helmet`
- CORS configuration
- rate limiting for `/api/*`
- request validation for contact and profile forms
- optional email notifications
- file-based persistence for submission records

## Notes

For true production durability, replace file storage with a database such as PostgreSQL, MongoDB, or another managed storage service.
