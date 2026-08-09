# Smarter Backend API

This is the Node.js + Express backend for the Smarter educational platform.

## Requirements
- Node.js >= 18
- MySQL >= 8.0

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment:**
   Copy the example environment file and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup & Migrations:**
   You don't need to create the database manually. The migration script will create it and apply the schema:
   ```bash
   npm run migrate
   ```

4. **Create Admin Account:**
   ```bash
   node scripts/create-admin.js
   ```

## Development

Start both the React frontend and the Express backend simultaneously from the root directory:
```bash
cd ..
npm run dev:all
```

Or just the backend:
```bash
cd server
npm run dev
```

## API Endpoints

- `GET /api/v1/health` - Check API and DB status
- `POST /api/v1/contact` - Submit contact form
- `POST /api/v1/auth/login` - Authenticate
- `POST /api/v1/auth/logout` - Clear session (client-side)
- `GET /api/v1/auth/me` - Get current user (requires token)

## Security
- Rate limiting is enabled (15 min windows).
- Zod is used for strong input validation.
- Passwords are hashed using bcrypt.
- JWT is used for stateless authentication.
- Helmet secures HTTP headers.
