@echo off
echo Starting Online XOX Development Server...
echo.
echo This will start both Next.js and Socket.IO server on port 3001
echo.
echo Opening browser in 5 seconds...
echo.

:: Start the server
powershell -ExecutionPolicy Bypass -Command "npm run dev"

pause