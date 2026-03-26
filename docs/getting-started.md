# Getting Started

This guide provides a beginner-friendly, step-by-step process for setting up the RoomMate application in a local development environment.

## Prerequisites
Ensure the following software is installed on your system:
*   **Node.js** (v18.0.0 or higher)
*   **npm** or **Yarn**
*   **PostgreSQL** (Local installation, Docker, or a Cloud instance)

## Setup Instructions

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/souravseal99/RoomMate.git
cd RoomMate
```

### 2. Backend Configuration
Navigate to the server directory and install dependencies:
```bash
cd roommate-server
npm install
```

### 3. Environment Variables
Create a `.env` file in the `roommate-server` directory. Use the provided template as a starting point:
```bash
cp .env.example .env
```
Open the `.env` file and configure your credentials:
```env
PORT=5000
DATABASE_URL="postgresql://DATABASE_USER:DATABASE_PASSWORD@localhost:5432/roommate_db"
JWT_ACCESS_SECRET="your_secure_access_secret"
JWT_REFRESH_SECRET="your_secure_refresh_secret"
```

### 4. Database Setup Options

#### Option A: Local PostgreSQL
Run the Prisma migration to initialize your schema:
```bash
npx prisma migrate dev --name init
```

#### Option B: Docker
If you have Docker and Docker Compose installed:
```bash
docker-compose up -d
```

#### Option C: Cloud (Neon/Supabase)
Update the `DATABASE_URL` in your `.env` file with the connection string provided by your cloud provider.

### 5. Frontend Configuration
In a new terminal window, navigate to the app directory and install dependencies:
```bash
cd roommate-app
npm install
```

## Running the Application

### Start the Backend Server
From the `roommate-server` directory:
```bash
npm run dev
```

### Start the Frontend Application
From the `roommate-app` directory:
```bash
npm run dev
```

## Expected Output
Once both services are running, the application will be accessible at:
*   **Frontend UI**: [http://localhost:5173](http://localhost:5173)
*   **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
