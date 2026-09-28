# React + Vite

## Local Setup

Requirements: Node.js and a local MongoDB server listening on `127.0.0.1:27017`.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set a private `JWT_SECRET`.
3. Start the API with `npm run server`. It creates the `timetable_scheduler` database and seeds demo users on first startup.
4. In another terminal, start the UI with `npm run dev`.

All application API endpoints require a valid token except health check, login, and student signup. Student accounts can self-register; creator and faculty accounts are provisioned by an administrator.

## Demo Accounts

| Role | Username | Password |
| --- | --- | --- |
| Creator | `creator` | `creator123` |
| Faculty | `faculty` | `faculty123` |
| Student | `student` | `student123` |

Passwords are hashed in MongoDB. These credentials are for local testing only.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
