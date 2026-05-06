@echo off
echo ============================================================
echo   TAG Logistica - Preparacion para Despliegue (DonWeb)
echo ============================================================
echo.

:: 1. Build Frontend
echo [1/3] Compilando Frontend (React)...
cd client
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo la compilacion del Frontend.
    pause
    exit /b %errorlevel%
)
cd ..

:: 2. Limpiar cache Laravel
echo [2/3] Limpiando caches de Laravel (API)...
cd api
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
cd ..

echo.
echo [3/3] LISTO PARA SUBIR.
echo.
echo INSTRUCCIONES FINALES:
echo 1. Sube el contenido de 'client/dist' a 'public_html' por FTP.
echo 2. Sube la carpeta 'api' al servidor.
echo 3. Configura el .env en el servidor con los datos de DonWeb.
echo.
pause
