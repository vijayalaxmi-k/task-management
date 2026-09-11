# Task Management API

Laravel API backend for the Task Management application.

## Tech stack

* PHP 8.3+
* Laravel 13
* Laravel Sanctum
* SQLite
* PHPUnit

## Setup

From the project root:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

The `.env` is already configured for SQLite (`DB_CONNECTION=sqlite`) — no database server to install or configure.

Create the database file:

```bash
touch database/database.sqlite
```

Run migrations:

```bash
php artisan migrate
```

Start the API:

```bash
php artisan serve
```

The API is available at:

```text
http://localhost:8000
```

## Authentication

The API uses Laravel Sanctum personal access tokens.

Users can:

* Register
* Log in
* Log out

Authenticated requests must include:

```text
Authorization: Bearer <token>
```

## API endpoints

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| POST   | `/api/register`            | Register a user    |
| POST   | `/api/login`               | Log in             |
| POST   | `/api/logout`              | Log out            |
| GET    | `/api/tasks`               | List user's tasks  |
| POST   | `/api/tasks`               | Create a task      |
| GET    | `/api/tasks/{task}`        | View a task        |
| PUT    | `/api/tasks/{task}`        | Update a task      |
| PATCH  | `/api/tasks/{task}/status` | Update task status |
| DELETE | `/api/tasks/{task}`        | Delete a task      |

The task list supports:

```text
/api/tasks?search=project&status=todo&priority=high
```

## Architecture

The implementation uses standard Laravel conventions:

* **Controllers** — API request handling
* **Form Requests** — input validation
* **API Resources** — consistent responses
* **Eloquent Models** — database relationships
* **Policies** — task ownership and authorization
* **Migrations** — database schema
* **Factories** — test data generation

Tasks belong to the authenticated user. Task queries are scoped to the current user, and individual task operations are protected by `TaskPolicy`.

No service/repository layer was added because the feature is small and the additional abstraction would not provide meaningful value for this scope.

## Tests

Run all backend tests:

```bash
php artisan test
```

Tests cover:

* Authentication
* Task CRUD
* Validation
* Task status updates
* Authorization
* User task isolation
* Search
* Status filtering
* Priority filtering
* Combined filters

## Assumptions

* Each task belongs to one user.
* Users cannot share tasks.
* Any task status can be changed directly.
* Due dates are optional.
* Email verification and password reset are outside the scope of the exercise.
* Notifications and reminders are outside the scope.
* Pagination is not implemented for this small dataset.

## Possible improvements

For a larger production application, this could be extended with:

* Pagination
* Email verification and password reset
* Task sharing and permissions
* Notifications and reminders
* More extensive API and frontend tests
* Environment-based frontend API configuration
