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
Set these environment variables:
- MSSQL_SERVER
- MSSQL_DATABASE
- MSSQL_USER
- MSSQL_PASSWORD
- MSSQL_PORT

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database