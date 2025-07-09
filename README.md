# Simple Interview: A Modern Web Application for Streamlined Technical Interview Management

## Overview

Simple Interview is a comprehensive, full-stack web application designed to centralize and optimize the technical interview process. It addresses common challenges such as fragmented data, inconsistent evaluations, and high operational overhead by providing an integrated platform for managing the entire interview lifecycle—from creating reusable templates and scheduling interviews to real-time coding, evaluation, and feedback.

Built with a focus on type safety, developer experience, and portability, Simple Interview is ideal for organizations looking for a self-hostable, efficient, and transparent solution for their technical hiring needs.

## Key Features

- **Centralized Interview Management:** Create, manage, and track technical interviews from a single platform.
- **Reusable Interview Templates:** Build and customize interview templates using a central question bank to ensure consistency.
- **Role-Based Access Control:** Secure authentication and authorization for Admins, Interviewers, and Candidates.
- **Real-time Coding Environment (Planned):** Future integration for collaborative code editing and execution during interviews.
- **Structured Evaluation & Feedback:** Tools for interviewers to provide consistent evaluations and detailed notes.
- **Email Notifications:** Automated invitations and updates for candidates and interviewers.
- **Containerized Deployment:** Easy setup and consistent environments across development, testing, and production using Docker and Docker Compose.
- **End-to-End Type Safety:** Leveraging TypeScript and GraphQL Code Generator for robust and error-free development.

## Technologies Used

Simple Interview is a monorepo project utilizing a modern full-stack architecture:

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **API:** GraphQL with Apollo Server and `type-graphql`
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Caching/Sessions:** Redis with `connect-redis` and `ioredis`
- **Password Security:** `argon2` for hashing, `secure-password-utilities` for generation
- **Email Service:** `resend`

### Frontend

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **GraphQL Client:** `urql` with `@urql/exchange-graphcache`
- **UI Components:** ShadCN/UI (built on Radix UI)
- **Styling:** Tailwind CSS
- **Code Generation:** GraphQL Code Generator
- **Form Management:** `react-hook-form`
- **Validation:** `zod`
- **Date Handling:** `dayjs`
- **Code Editor:** `@uiw/react-textarea-code-editor`
- **Routing:** `react-router`
- **Notifications:** `sonner`
- **Data Tables:** `@tanstack/react-table`

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your system:

- [**Docker**](https://www.docker.com/get-started)
- [**Docker Compose**](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)

### Installation

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/your-username/simple-interview.git # Replace with your actual repo URL
    cd simple-interview
    ```

2.  **Environment Variables:**
    The application uses environment variables for configuration. Create two `.env` files:

    - A `.env` file in the **project root directory** (`/simple-interview/.env`) for backend and Docker Compose variables:

      ```dotenv
      # Database Configuration
      POSTGRES_USER=postgres
      POSTGRES_PASSWORD=postgres
      POSTGRES_DB=simpleinterview
      DATABASE_URL=postgresql://postgres:postgres@postgres:5432/simpleinterview

      # Redis Configuration
      REDIS_URL=redis://redis:6379

      # Server Configuration
      PORT=3000
      CLIENT_URL=http://localhost:80
      COOKIE_NAME=qid
      NODE_ENV=development

      # Email Configuration (for sending interview invitations)
      RESEND_API_KEY=re_xxxxxxxxx # Replace with your Resend API Key or set to 're_123' to log emails to console
      DISABLE_EMAILS=true # Set to false to enable email sending
      ```

    - A `.env` file inside the **`client/` directory** (`/simple-interview/client/.env`) for frontend-specific variables:
      `dotenv

    # client/.env

    VITE*API_URL=http://localhost:3000/graphql
    `
    \_Note: Replace placeholder values with your actual credentials and desired settings.*

3.  **Build and Run with Docker Compose:**
    Navigate to the project root directory in your terminal and run the following command to build the Docker images and start all services:

    ```bash
    docker compose up --build
    ```

    This command will:

    - Build the `client` and `server` Docker images based on their respective `Dockerfile`s.
    - Start the `postgres` database container.
    - Start the `redis` cache container.
    - Start the `server` (Node.js backend) container.
    - Start the `client` (Nginx serving React) container.
      The `--build` flag ensures that the images are rebuilt if there are any changes to the Dockerfiles or source code.

4.  **Access the Application:**
    Once all services are up and running, you can access the frontend application in your web browser at `http://localhost:80`.

### Initial Account Setup

After the application is running, you need to register an admin account. Navigate to the `/admin-signup` route in your browser (e.g., `http://localhost:80/admin-signup`) and create your first admin user.

### Email Configuration

Emails (e.g., interview invitations) are sent using [Resend](https://resend.com/).

- To enable actual email sending, set the `RESEND_API_KEY` environment variable in your root `.env` file to your Resend API key.
- If you don't have a Resend account or prefer to disable actual email sending during development, you can leave `RESEND_API_KEY=re_xxxxxxxxx` (or any placeholder) and set `DISABLE_EMAILS=true`. Emails will then be logged to the console instead of being sent.
- Removing the `RESEND_API_KEY` environment variable entirely will cause an error.

## Running Tests

### Backend Tests

To run backend tests using Jest:

```bash
cd server
npm test
# or for coverage
npm run test:coverage
```

### Frontend Tests

To run frontend tests using Vitest:

```bash
cd client
npm test
# or for coverage
npm run test:coverage
# or with UI
npm run test:ui
```

## Project Structure

The project is organized as a monorepo with two main applications:

- `client/`: The React frontend application.
- `server/`: The Node.js backend API.

Each application has its own `package.json`, `Dockerfile`, and `src` directory containing its respective source code.

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Ensure tests pass and add new tests for your changes.
5.  Commit your changes (`git commit -m 'feat: Add new feature'`).
6.  Push to the branch (`git push origin feature/your-feature-name`).
7.  Open a Pull Request.

Please ensure your code adheres to the existing style and conventions.

## License

This project is licensed under the MIT License.
