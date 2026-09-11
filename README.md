# Task Management

A full-stack task management app: a Laravel API backend with Sanctum token authentication, and a React + TypeScript frontend. Each user registers/logs in and manages only their own tasks (create, edit, delete, change status, search, and filter by status/priority).

## Tech stack

- **Backend:** Laravel 13, Sanctum (API token auth), SQLite
- **Frontend:** React 19, TypeScript, Vite, Axios (no state-management library — plain component state)
- **Tests:** PHPUnit (Feature tests for auth, task CRUD, authorization, filtering)

## Project structure

```
backend/    Laravel API (routes/api.php, app/Http, app/Models, app/Policies, tests/Feature)
frontend/   React + TypeScript SPA (src/pages, src/components, src/api)
```

## Prerequisites

- PHP 8.3+ and Composer
- Node.js 18+ and npm

## Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API runs at `http://localhost:8000`. Seeding creates a test user:

- **Email:** `test@example.com`
- **Password:** `password`

Run the test suite:

```bash
php artisan test
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks to the API at `http://localhost:8000/api` (see `src/api/axios.ts`). Make sure the backend is running first.

Other frontend commands:

```bash
npm run lint    # ESLint
npm run build   # Type-check + production build
```

## Features

- Register / log in / log out (Sanctum token auth, `Authorization: Bearer <token>`)
- Create, edit, delete tasks
- Update task status inline (todo / in progress / done)
- Search tasks by title/description, filter by status and priority (debounced, combinable)
- Users can only view, edit, or delete their own tasks (enforced by `TaskPolicy` — cross-user access returns 403)
- Loading, empty, and error states throughout the UI; server-side validation errors surfaced in forms

## API overview

| Method | Endpoint             | Description                  |
| ------ | --------------------- | ----------------------------- |
| POST   | `/api/register`       | Create an account, returns token |
| POST   | `/api/login`           | Log in, returns token         |
| POST   | `/api/logout`          | Revoke current token (auth)   |
| GET    | `/api/tasks`           | List the authenticated user's tasks (`search`, `status`, `priority` query params) |
| POST   | `/api/tasks`           | Create a task                 |
| GET    | `/api/tasks/{task}`    | View a task                   |
| PUT    | `/api/tasks/{task}`    | Update a task                 |
| PATCH  | `/api/tasks/{task}/status` | Update only a task's status |
| DELETE | `/api/tasks/{task}`    | Delete a task                 |

All `/api/tasks*` routes require `Authorization: Bearer <token>`.
