@echo off
setlocal enabledelayedexpansion
title Instalador y Lanzador de TAG Logistica

:: Definir colores simples (opcional, omitido para maxima compatibilidad)
echo ===================================================
echo   TAG LOGISTICA - SCRIPT DE DESPLIEGUE AUTOMATICO  
echo ===================================================
echo [LOG] Iniciando proceso de montaje de aplicacion...
echo.

:: 1. Verificar Git
echo [LOG] Verificando requisitos del sistema: Git...
where git >nul 2>nul
if %errorlevel% neq 0 goto :NO_GIT

:: 2. Verificar Docker
echo [LOG] Verificando requisitos del sistema: Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 goto :NO_DOCKER

:: 3. Verificar Carpeta / Clonar
if exist "docker-compose.yml" goto :GOT_FILES

echo [LOG] No se encontro docker-compose.yml en la carpeta actual. 
echo [LOG] Intentando clonar el repositorio desde GitHub...
:: RECUERDA: Cambiar el link de abajo por el tuyo real antes de distribuir
git clone https://github.com/usuario/TAG.git .
if !errorlevel! neq 0 goto :CLONE_FAIL
goto :SYNC_DONE

:GOT_FILES
echo [LOG] Proyecto detectado localmente. Buscando actualizaciones...
git pull origin develop >nul 2>&1
if !errorlevel! neq 0 (
    echo [ADVERTENCIA] No se pudo sincronizar con GitHub. Se usara la version local.
)

:SYNC_DONE
:: 4. Preparar Backend (.env)
echo [LOG] Mapeando archivos de configuracion...
if not exist "api\.env" (
    if exist "api\.env.example" (
        copy /Y "api\.env.example" "api\.env" >nul
        echo [LOG] - Archivo api\.env generado.
    ) else (
        echo [ADVERTENCIA] No se encontro api\.env.example.
    )
)

:: 5. Instalar Node Modules (Frontend)
echo [LOG] Instalando paquetes del cliente...
docker run --rm -v "%cd%\client:/app" -w /app node:20-alpine npm install
if %errorlevel% neq 0 goto :INSTALL_FAIL

:: 6. Instalar Composer Packages (Backend)
echo [LOG] Instalando dependencias del API...
docker run --rm -v "%cd%\api:/app" -w /app composer:latest install --ignore-platform-reqs
if %errorlevel% neq 0 goto :INSTALL_FAIL

:: 7. Iniciar el entorno General
echo [LOG] Levantando infraestructura con Docker-Compose...
docker-compose up -d --build
if %errorlevel% neq 0 goto :COMPOSE_FAIL

:: 8. Operaciones Post-Instalacion
echo [LOG] Generando clave de aplicacion...
docker-compose exec api php artisan key:generate

echo [LOG] Esperando a la base de datos...
timeout /t 10 /nobreak >nul

echo [LOG] Ejecutando migraciones...
docker-compose exec api php artisan migrate --force

echo.
echo ===================================================
echo   DESPLIEGUE FINALIZADO CON EXITO
echo ===================================================
echo Frontend : http://localhost:5173
echo API      : http://localhost:8000
echo.
pause
exit /b 0

:NO_GIT
echo [ERROR CRITICO] Git no esta instalado.
pause
exit /b 1

:NO_DOCKER
echo [ERROR CRITICO] Docker no esta corriendo o instalado.
pause
exit /b 1

:CLONE_FAIL
echo [ERROR] No se pudo clonar el repositorio. Verifica tu conexion.
pause
exit /b 1

:INSTALL_FAIL
echo [ERROR CRITICO] Fallo la instalacion de dependencias (Node/Composer).
pause
exit /b 1

:COMPOSE_FAIL
echo [ERROR CRITICO] Docker-Compose fallo. Revisa los puertos 5173, 8000 y 3306.
pause
exit /b 1