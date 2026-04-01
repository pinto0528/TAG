@echo off
setlocal enabledelayedexpansion
title Instalador y Lanzador de TAG Logistica

echo ===================================================
echo   TAG LOGISTICA - SCRIPT DE DESPLIEGUE AUTOMATICO  
echo ===================================================
echo [LOG] Iniciando proceso de montaje de aplicacion...
echo.

:: 1. Verificar existencia de Git
echo [LOG] Verificando requisitos del sistema (Git)...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Git no esta instalado o no esta en el PATH.
    echo Por favor instala Git desde https://git-scm.com/
    pause
    exit /b 1
)

:: 2. Verificar existencia de Docker
echo [LOG] Verificando requisitos del sistema (Docker)...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Docker no esta instalado o no se encuentra activo.
    echo Asegurate de tener Docker Desktop instalado y corriendo.
    pause
    exit /b 1
)

:: 3. Verificar Archivos o Clonar de Github
if not exist "docker-compose.yml" (
    echo [LOG] No se encontro docker-compose.yml en la carpeta actual. 
    echo [LOG] Intentando clonar el repositorio desde GitHub...
    
    :: ATENCION USUARIO: REEMPLAZA EL LINK DE ABAJO POR TU ENLACE REAL DE GITHUB
    git clone https://github.com/usuario/TAG.git .
    
    if !errorlevel! neq 0 (
        echo [ERROR] Hubo un problema al clonar el repositorio.
        echo Asegurate de que la carpeta este totalmente vacia e intenta de nuevo.
        pause
        exit /b 1
    )
) else (
    echo [LOG] Proyecto detectado localmente. Buscando ultimas actualizaciones (git pull)...
    git pull origin develop
    if !errorlevel! neq 0 (
        echo [ADVERTENCIA] Git alerto problemas o no hay internet. Se continuara con la version local.
    )
)

:: 4. Preparar Backend (.env)
echo [LOG] Mapeando archivos de configuracion...
if not exist "api\.env" (
    if exist "api\.env.example" (
        copy /Y "api\.env.example" "api\.env" >nul
        echo [LOG] - Archivo api\.env generado exitosamente.
    ) else (
        echo [ADVERTENCIA] No se encontro api\.env.example. Probablemente deba crear un .env manual.
    )
) else (
     echo [LOG] - Archivo api\.env ya existe. Omitiendo.
)

:: 5. Instalar Node Modules (Frontend) via Docker temporal
echo [LOG] Instalando paquetes de Node.js en el cliente (aislado en Docker)...
docker run --rm -v "%cd%\client:/app" -w /app node:20-alpine npm install
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Fallo la instalacion de paquetes de React/Vite.
    pause
    exit /b 1
)

:: 6. Instalar Composer Packages (Backend) via Docker temporal
echo [LOG] Instalando dependencias de PHP/Laravel (aislado en Docker)...
docker run --rm -v "%cd%\api:/app" -w /app composer:latest install --ignore-platform-reqs
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Fallo la compilacion de Vendor para Laravel.
    pause
    exit /b 1
)

:: 7. Iniciar el entorno General
echo [LOG] Levantando la infraestructura principal (Base de Datos, API, Cliente)...
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR CRITICO] Docker-Compose fallo en iniciar los servicios principales. Revisa si un puerto (3306, 8000 o 5173) esta ocupado.
    pause
    exit /b 1
)

:: 8. Operaciones Post-Instalacion BD
echo [LOG] Generando clave local de aplicacion Laravel...
docker-compose exec api php artisan key:generate

echo [LOG] Esperando inicializacion segura del motor MySQL...
timeout /t 10 /nobreak >nul

echo [LOG] Lanzando migraciones de la Base de Datos...
docker-compose exec api php artisan migrate --force

echo.
echo ===================================================
echo   DESPLIEGUE FINALIZADO CON EXITO
echo ===================================================
echo Tu monorepo "TAG Logistica" ya esta operando localmente:
echo.
echo [ APP ] Frontend (React/Vite) : http://localhost:5173
echo [ API ] Backend (Laravel)     : http://localhost:8000
echo [ DB  ] MySQL 8.0             : localhost:3306
echo.
echo Si en algun momento quieres apagar los servidores,
echo ejecuta por consola: "docker-compose down"
echo.
echo Presiona cualquier boton para cerrar esta ventana...
pause >nul
exit /b 0