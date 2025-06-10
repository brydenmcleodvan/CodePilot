# CodePilot

## Project Summary

CodePilot is a comprehensive health management platform that aggregates biometric data, goal tracking, genetic risk insights and personal health events into a single interface. It helps users monitor progress and receive tailored feedback to improve their wellbeing.

## Key Features

- **Health tracking** for metrics, symptoms and medications
- **Personalized insights** powered by machine learning
- **Wearable integrations** to sync data from external devices

## Tech Stack

- **TypeScript** for client and server code
- **Express** API server
- **PostgreSQL** database (via Drizzle ORM)
- **TailwindCSS** styling
- **Vite** build tool

## Getting Started

Install dependencies and launch the development server:

```bash
npm install
npm run dev
```

Use `start-all.sh` to run both the Node.js backend and Streamlit interface together.

## Folder Structure Overview

- `client/` – React frontend powered by Vite
- `server/` – Express API and storage modules
- `components/` – Shared UI components for the Streamlit app
- `docs/` – Additional project documentation
- `tests/` – Test suites and helpers
- `utils/` – Utility scripts and shared helpers

## Contribution Guidelines

1. Create a topic branch from `main`.
2. Follow the coding style in this repository and add unit tests when possible.
3. Submit changes through a pull request and request review.

See `docs/BRANCH_PROTECTION.md` for recommended branch protection settings.

## Future Roadmap

- Expand wearable device support
- Add advanced analytics and alerting
- Improve CI test coverage

