@echo off
echo === TAG Logistica - Base de Datos ===
echo.
echo Migrando y sembrando datos de prueba...
cd /d "%~dp0api"
C:\php84\php.exe artisan migrate:fresh --seed --force
echo.
echo Listo! Base de datos reiniciada con datos nuevos.
pause
