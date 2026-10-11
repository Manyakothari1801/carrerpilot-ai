# Windows PowerShell runbook

Run each long-lived service in its own PowerShell terminal from the repository root.

## 1. PostgreSQL

```powershell
docker compose up -d postgres
docker compose ps
docker port careerpilot-postgres
```

Expected host mapping: `5433 -> 5432`. Do not use `docker compose down -v` if data must be retained.

## 2. Train the model only when absent

```powershell
cd ml-service
if (-not (Test-Path .\models\career_model.joblib)) {
  py -3.11 -m venv .venv
  .\.venv\Scripts\Activate.ps1
  python -m pip install -r requirements.txt
  python training/generate_curated_dataset.py
  python -m training.train
}
```

## 3. FastAPI

```powershell
cd ml-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## 4. Spring Boot

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE='local'
$env:PORT='8081'
$env:DB_URL='jdbc:postgresql://localhost:5433/careerpilot'
$env:DB_USERNAME='careerpilot'
$env:DB_PASSWORD='careerpilot_local'
$env:JWT_SECRET='<at-least-32-random-characters>'
$env:FRONTEND_ORIGIN='http://localhost:5173'
$env:ML_SERVICE_URL='http://localhost:8000'
$env:AI_ENABLED='false'
$env:APP_FRONTEND_URL='http://localhost:5173'
.\mvnw.cmd spring-boot:run
```

Mail and Gemini are optional. Configure their variables from `backend/.env.example` only when required; never paste secrets into tracked files.

## 5. React web

```powershell
cd frontend
$env:VITE_API_BASE_URL='http://localhost:8081/api/v1'
npm install
npm run dev -- --host 0.0.0.0
```

## 6. Physical-phone URLs

Find the active private-network address with `ipconfig`. Replace `<PC-LAN-IP>` below and permit inbound TCP 8081 and 5173 on the Windows private network.

## 7. Expo

```powershell
cd mobile
$env:EXPO_PUBLIC_API_BASE_URL='http://<PC-LAN-IP>:8081/api/v1'
$env:EXPO_PUBLIC_WEB_APP_URL='http://<PC-LAN-IP>:5173'
npm install
npm start
```

For the Android emulator use `10.0.2.2` instead of the LAN address.

## 8. Health verification

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/version
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-WebRequest http://localhost:8081/v3/api-docs -UseBasicParsing
Invoke-WebRequest http://localhost:5173 -UseBasicParsing
```

## 9. Stop safely

Stop FastAPI, Spring Boot, Vite, and Expo with `Ctrl+C` in their terminals. Then:

```powershell
docker compose stop postgres
```

`docker compose stop` preserves the named volume and database data.
