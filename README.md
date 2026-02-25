# Photos

A photo gallery web app with upload, tagging, search, and user authentication.

## Tech Stack

- **Next.js 16** (App Router)
- **PostgreSQL** with **Prisma 7**
- **NextAuth.js** (credentials authentication)
- **Tailwind CSS 4**

## Features

- Photo gallery with grid layout
- Search by title, description, or tags
- Filter by tags
- Sort by date or title
- Photo upload with drag & drop (authenticated users)
- Photo management — edit titles, descriptions, tags, or delete (authenticated users)
- Guest browsing (no login required to view)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Seed the default admin user:

```bash
npm run db:seed
```

This creates an admin user with username `admin` and password `admin`.

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed default admin user |
| `npm run db:setup` | Run migrations + seed |
