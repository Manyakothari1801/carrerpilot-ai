## Local Development Setup (Windows)

Follow these instructions to run Career Guidance AI on your local machine.

### 1. Prerequisites

Install the following software:

- Git
- Java JDK 21
- Node.js and npm
- Python 3.10 or later
- Docker Desktop (for PostgreSQL)
- VS Code (recommended)
- Android Studio (optional, for the mobile application)

### 2. Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/Manyakothari1801/carrerpilot-ai.git
cd carrerpilot-ai
```

### 3. PostgreSQL Database Setup

Start Docker Desktop.

Create a PostgreSQL 16 container:

```powershell
docker run --name careerpilot-postgres -e POSTGRES_USER=careerpilot -e POSTGRES_PASSWORD=careerpilot -e POSTGRES_DB=careerpilot -p 5433:5432 -v careerpilot_pgdata:/var/lib/postgresql/data -d postgres:16
```

For subsequent runs:

```powershell
docker start careerpilot-postgres
```

Database connection details:

- Host: `localhost`
- Port: `5433`
- Database: `careerpilot`
- Username: `careerpilot`
- Password: `careerpilot` (local development only)

The Spring Boot backend uses Flyway for database migrations.

### 4. Spring Boot Backend Setup

Open a PowerShell terminal:

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env` and configure the local database connection:

```dotenv
SPRING_PROFILES_ACTIVE=local
DB_URL=jdbc:postgresql://localhost:5433/careerpilot
DB_USERNAME=careerpilot
DB_PASSWORD=careerpilot
JWT_SECRET=replace-with-a-unique-random-secret-at-least-32-characters
FRONTEND_ORIGIN=http://localhost:5173
APP_FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

Generate your own JWT secret. Do not share or commit it.

To use Gemini-powered features, configure your own Gemini API key and enable the relevant AI settings.

Run the backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL:

`http://localhost:8081`

Keep this terminal running.

### 5. FastAPI ML Service Setup

Open a new PowerShell terminal from the project root:

```powershell
cd ml-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the ML service:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

ML service URL:

`http://localhost:8000`

API documentation (if enabled):

`http://localhost:8000/docs`

Keep this terminal running.

### 6. React Frontend Setup

Open another PowerShell terminal from the project root:

```powershell
cd frontend
Copy-Item .env.example .env
npm ci
```

Configure the frontend environment variables in `.env` using the backend URL `http://localhost:8081`. Use the variable names provided in `frontend/.env.example`.

Start the frontend:

```powershell
npm run dev
```

Open the local URL displayed by Vite, typically:

`http://localhost:5173`

### 7. Expo Mobile Application (Optional)

Install Android Studio and configure an Android emulator.

Open another terminal:

```powershell
cd mobile
Copy-Item .env.example .env
npm ci
```

Configure the mobile API URL in `.env` using the variable name in `mobile/.env.example`.

For the standard Android emulator, the host computer can generally be reached using `10.0.2.2` instead of `localhost`.

Start Expo:

```powershell
npx expo start
```

Press `a` to open the application in an available Android emulator.

### 8. Recommended Startup Order

1. Start Docker Desktop and PostgreSQL.
2. Start the FastAPI ML service.
3. Start the Spring Boot backend.
4. Start the React frontend.
5. Start the Expo mobile application if needed.

Keep the backend, frontend and ML service running in separate terminals.

### 9. Common Troubleshooting

**Java or Maven command not recognized**

Verify Java 21:

```powershell
java -version
```

Use the included Maven wrapper:

```powershell
.\mvnw.cmd spring-boot:run
```

**Python virtual environment activation blocked**

Run in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

**Database connection refused**

Check whether Docker Desktop is running and inspect the container:

```powershell
docker ps -a
docker logs careerpilot-postgres
```

**Frontend cannot connect to backend**

Verify the frontend API URL, backend port, and CORS settings.

**Mobile app cannot reach backend**

Use the correct emulator or LAN address. A physical phone cannot use the laptop's `localhost` address.

### 10. Security Guidelines

- Never commit `.env` files containing real credentials.
- Use `.env.example` files only for configuration templates.
- Each teammate should generate their own JWT secret.
- Do not commit Gemini API keys, SMTP passwords, database passwords or private keys.
- Use separate credentials for production deployments.

### 11. Quick Reference

| Component | Technology | Local Port |
|---|---|---|
| Frontend | React, TypeScript, Vite | 5173 |
| Backend | Java 21, Spring Boot | 8081 |
| Database | PostgreSQL 16 | 5433 |
| ML Service | Python, FastAPI | 8000 |
| Mobile | React Native, Expo | Expo development server |

**Note:** Configuration values and startup commands should be checked against the corresponding `.env.example`, Docker and application configuration files when the project is updated.
