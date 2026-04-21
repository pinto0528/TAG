@echo off
setlocal enabledelayedexpansion
title Instalador y Lanzador de TAG Logistica

echo ===================================================
echo   TAG LOGISTICA - SCRIPT DE DESPLIEGUE AUTOMATICO  
echo ===================================================
echo [LOG] Iniciando proceso...
echo.

:: 1. Verificar Git
echo [LOG] Verificando Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Git no esta instalado.
    pause
    exit /b 1
)

:: 2. Verificar Docker
echo [LOG] Verificando Docker (esperando respuesta del motor)...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] El motor de Docker no esta respondiendo.
    echo Asegurate de que Docker Desktop este abierto y el icono este verde.
    echo.
    pause
    exit /b 1
)

:: 3. Verificar Archivos / Sincronizar
if not exist "docker-compose.yml" (
    echo [LOG] No se encontro docker-compose.yml. Clonando...
    git clone https://github.com/pinto0528/TAG.git .
    if !errorlevel! neq 0 (
        echo [ERROR] No se pudo clonar el repositorio.
        pause
        exit /b 1
    )
) else (
    echo [LOG] Proyecto detectado. Sincronizando rama actual...
    for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set "CB=%%a"
    echo [LOG] Rama actual: !CB!
    git pull origin "!CB!"
    if !errorlevel! neq 0 (
        echo [ADVERTENCIA] No se pudo sincronizar con GitHub. Se usara version local.
    )
)

:: 4. Configuracion
echo [LOG] Preparando .env...
if not exist "api\.env" (
    if exist "api\.env.example" (
        copy /Y "api\.env.example" "api\.env" >nul
    )
)

:: 5. Instalacion
echo [LOG] Instalando dependencias Node (Frontend)...
docker run --rm -v "%cd%\client:/app" -w /app node:20-alpine npm install
if !errorlevel! neq 0 goto :FAIL

echo [LOG] Instalando dependencias Composer (Backend)...
docker run --rm -v "%cd%\api:/app" -w /app composer:latest install --ignore-platform-reqs
if !errorlevel! neq 0 goto :FAIL

:: 6. Levantar
echo [LOG] Levantando contenedores...
docker-compose up -d --build
if !errorlevel! neq 0 goto :FAIL

:: 7. Artisan
echo [LOG] Configurando base de datos...
docker-compose exec api php artisan key:generate --ansi
echo [LOG] Esperando DB (10s)...
timeout /t 10 /nobreak >nul
docker-compose exec api php artisan migrate --force

echo.
echo ===================================================
echo   DESPLIEGUE FINALIZADO CON EXITO
echo ===================================================
echo URL: http://localhost:5173
echo.
pause
exit /b 0

:FAIL
echo.
echo [ERROR CRITICO] Hubo un fallo en la instalacion.
echo Revisa que Docker tenga recursos suficientes y los puertos 8000/5173 esten libres.
pause
exit /b 1