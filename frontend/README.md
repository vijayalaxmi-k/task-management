# Task Management Frontend

React + TypeScript frontend for the Task Management application.

## Tech stack

* React 19
* TypeScript
* Vite
* Axios
* ESLint

## Setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend is available at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:8000/api
```

The API URL is currently configured in:

```text
src/api/axios.ts
```

## Features

* User registration, login, and logout
* Task listing
* Create tasks
* Edit tasks
* Delete tasks with confirmation
* Update task status directly from the list
* Search by title or description
* Filter by status
* Filter by priority
* Combine search and filters
* Loading, empty, and error states
* Overdue due-date indication
* Responsive layout
* Form validation

## Project structure

```text
src/
├── api/             API and authentication requests
├── components/      Reusable UI components
├── constants/       Shared task options
├── pages/           Application pages
├── types/           TypeScript types
├── App.tsx
└── main.tsx
```

## Authentication

The frontend uses the Laravel API with Sanctum bearer tokens.

After registering or logging in, the access token is stored locally and automatically attached to API requests through the Axios interceptor.

## State management

The application uses plain React component state.

A dedicated state-management library was not added because the application is small and the current state requirements can be handled cleanly with React's built-in state management.

## API integration

API requests are centralized under:

```text
src/api/
```

Task operations include:

* Fetch tasks
* Create task
* Update task
* Update task status
* Delete task

## Validation and error handling

The UI provides client-side validation for required task fields and displays API validation or request errors to the user.

Loading states are shown during API operations to prevent duplicate actions and provide feedback.

## Quality checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Both should pass before submitting the project.

## Assumptions

* The backend is responsible for authoritative validation and authorization.
* The frontend assumes the API is available at `http://localhost:8000/api`.
* Authentication uses bearer tokens returned by the backend.
* No global state-management library is required for the current scope.

## Possible improvements

* Configure the API URL through environment variables.
* Add automated frontend component/E2E tests.
* Add pagination for larger task lists.
* Add more detailed accessibility testing.
* Add a password reset flow.

The implementation intentionally keeps the frontend small and maintainable while covering the core task-management workflow required for the exercise.
