# Acme Health Job Management Dashboard

## Project Overview
This is a React-based job management dashboard with Express.js backend and Microsoft SQL Server database integration.

## Technology Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: Microsoft SQL Server with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── database/             # Database-specific files (exported)
```

## Key Features
- Dashboard with summary cards and data grids
- Job description management with track changes
- Real-time database health monitoring
- Notification system with dropdown functionality
- User management with modal operations
- Microsoft SQL Server integration with fallback

## Setup Instructions
1. Install Node.js (v18+)
2. Run `npm install` to install dependencies
3. Configure database connection in environment variables
4. Run `npm run dev` to start development server

## Database Configuration
Set these environment variables (on Vercel: Project Settings → Environment Variables, then redeploy):
- `DB_SERVER` (or `MSSQL_SERVER`) – SQL Server host name
- `DB_NAME` (or `MSSQL_DATABASE`)
- `DB_USER` (or `MSSQL_USER`)
- `DB_PASSWORD` (or `MSSQL_PASSWORD`)
- `DB_PORT` (or `MSSQL_PORT`) – optional, defaults to 1433

Optional: `DB_ENCRYPT` (default `true`), `DB_TRUST_SERVER_CERTIFICATE` (default `true`),
`DB_CONNECTION_TIMEOUT` (ms, default 15000), `DB_POOL_MAX` (default 5).

The database must accept connections from the internet: Vercel functions run on
dynamic IPs, so a SQL Server firewall that only allows specific IPs will refuse them.

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database