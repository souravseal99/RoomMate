# Backend Overview

## Architecture
The RoomMate backend is a **RESTful API** built with **Node.js** and **Express**, using **Prisma ORM** for PostgreSQL database interactions. The system is designed following a modular Service-Based architecture.

## Folder Structure
The `roommate-server/src` directory is structured for scalability:
- **`auth/`**: Authentication logic, token management, and strategies.
- **`features/`**: (e.g., `expenses`, `chores`, `inventory`) Each feature folder contains its own controllers, services, and route definitions.
- **`common/`**: Shared utilities, custom error classes, and common middleware.
- **`prisma/`**: Database schema definition and migration files.

## Controller-Service Pattern
To maintain clean code and testability, we separate logic into two distinct layers:
1. **Controllers**: Handle the HTTP interface (reading request parameters, headers, and returning status codes).
2. **Services**: Contain the core business logic and direct database queries via Prisma. Controllers call services to perform actions.

## Middleware Layer
The backend utilizes several layers of middleware:
- **`authenticationMiddleware`**: Validates JWTs on protected routes.
- **`validationMiddleware`**: Uses libraries like `Zod` or `Joi` to validate request bodies before processing.
- **`errorHandler`**: A centralized catch-all for managing exceptions and returning standardized error responses.
