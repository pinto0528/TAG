@echo off
echo === TAG Logistica - Cerrando servidores ===
echo.

echo Cerrando Backend (puerto 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000.*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Cerrando Frontend (puerto 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173.*LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Cerrando procesos Node y PHP...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM php.exe >nul 2>&1

echo.
echo Listo! Todos los servidores cerrados.
pause
