# Team-Member-backend

A NestJS REST API for managing team members with JWT authentication, favorites, and file uploads. Uses SQLite via Prisma ORM.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Team-Member-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Generate the Prisma client and push the schema to the SQLite database:

```bash
npm run prisma:generate
npm run prisma:push
```

### 5. (Optional) Seed the database

Populate the database with initial data:

```bash
npm run prisma:seed
```

### 6. Run the application

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

The server will start at `http://localhost:3000`.

---

## API Documentation

Interactive Swagger docs are available at:

```
http://localhost:3000/api
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start in watch/dev mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run the compiled production build |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:push` | Push schema changes to the database |
| `npm run prisma:seed` | Seed the database with sample data |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix source files |

---

## Project Structure

```
src/
├── auth/           # JWT authentication (signup, login, guards)
├── team-members/   # Team member CRUD and filtering
├── upload/         # File upload handling
├── users/          # User profile and favorites
└── prisma/         # Prisma service

prisma/
├── schema.prisma   # Database schema
└── seed.ts         # Seed script

uploads/            # Uploaded avatar files (served statically)
```
