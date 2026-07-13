@echo off
echo Iniciando Backend (API)...
cd /d "%~dp0api"
C:\php84\php.exe artisan serve --host=0.0.0.0 --port=8000
