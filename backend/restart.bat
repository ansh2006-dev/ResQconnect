@echo off
echo Stopping any existing processes on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /F /PID %%a
)
echo Starting backend server...
npm run dev 