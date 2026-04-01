@echo off
echo Reiniciando el sistema TAG (Frontend y Backend)...
docker-compose restart
echo.
echo ¡Todo reiniciado exitosamente! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
pause
