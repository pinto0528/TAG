@echo off
echo Levantando el sistema TAG...
docker-compose up -d
echo Todo listo! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
pause