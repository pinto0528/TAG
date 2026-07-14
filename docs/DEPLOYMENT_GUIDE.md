# Guía de Despliegue - TAG Logística

Este documento detalla los pasos necesarios para realizar el despliegue del sistema en **DonWeb** (Hosting Compartido / Plan Básico) y explica las investigaciones realizadas sobre el rendimiento y el entorno.

---

## 1. Estado del Proyecto en Producción
*   **Dominio**: `http://logisticatag.com.ar`
*   **API**: `http://logisticatag.com.ar/api` (Confirmada y respondiendo con datos reales).
*   **Entorno**: Hosting compartido (Ferozo). **No soporta Docker ni procesos de Node persistentes.**

---

## 2. Preparación del Frontend (React)
Como el servidor no puede ejecutar `npm run dev`, debemos subir la aplicación compilada.

1.  **Configuración de API**:
    *   Asegúrate de que en la raíz de `client/` exista un archivo `.env.production` (o edita el `.env`) con la siguiente línea:
        ```env
        VITE_API_URL=http://logisticatag.com.ar/api
        ```
2.  **Generar el Build**:
    *   Desde la terminal en la carpeta `client/`:
        ```bash
        npm install
        npm run build
        ```
    *   Esto creará la carpeta `client/dist`.
3.  **Subida**:
    *   Sube el contenido de `client/dist` directamente a la carpeta `public_html` del servidor mediante FTP.

---

## 3. Preparación del Backend (Laravel)
1.  **Subida de archivos**:
    *   Sube todo el contenido de la carpeta `api/` al servidor (puedes excluir `node_modules`, `tests` y archivos de Docker).
2.  **Configuración de Entorno**:
    *   En el servidor, renombra `.env.example` a `.env` (o edita el existente).
    *   Configura las credenciales de la base de datos MySQL creada en el panel de DonWeb:
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1 (o el que indique DonWeb)
        DB_PORT=3306
        DB_DATABASE=nombre_bd_donweb
        DB_USERNAME=usuario_bd_donweb
        DB_PASSWORD=password_bd_donweb
        APP_DEBUG=false
        APP_ENV=production
        ```
3.  **Permisos de Carpeta**:
    *   Asegúrate de que las carpetas `storage` y `bootstrap/cache` tengan permisos de escritura (chmod 775 o 777).
4.  **Acceso Público**:
    *   DonWeb debe apuntar el dominio a `public_html/api/public` (si subiste la API en una subcarpeta) o usar un archivo `.htaccess` en la raíz para redirigir el tráfico.

---

## 4. Base de Datos
1.  **Exportar local**: Usa una herramienta como phpMyAdmin o `mysqldump` para exportar tu base de datos local.
2.  **Importar en DonWeb**: Entra al phpMyAdmin de DonWeb e importa el archivo `.sql`.

---

## 5. Notas sobre el Rendimiento (Carga Lenta)
Durante la investigación, se detectó que la carga de viajes tarda varios segundos en el entorno local de desarrollo.
*   **Causa**: No es la base de datos. Es un cuello de botella de **concurrencia** del comando `php artisan serve`.
*   **Explicación**: El frontend hace 5 peticiones simultáneas al iniciar. `artisan serve` las procesa de a una (secuencialmente). En Docker sobre Windows, esto suma latencia por cada petición.
*   **En Producción**: Este problema **no debería ocurrir** en DonWeb, ya que el servidor usa Apache/Nginx con PHP-FPM, que maneja múltiples peticiones en paralelo de forma eficiente.

---

## 6. Automatización Sugerida (Script de Pre-Despliegue)
Si deseas automatizar la preparación, puedes crear un archivo `pre-deploy.bat` en la raíz con:

```batch
@echo off
echo Preparando archivos para deploy...

:: 1. Build Frontend
cd client
echo Compilando Frontend...
call npm run build
cd ..

:: 2. Limpiar cache Laravel
cd api
echo Limpiando caches de Laravel...
php artisan config:clear
php artisan cache:clear
cd ..

echo Proceso terminado. Sube el contenido de 'client/dist' y la carpeta 'api' al servidor.
pause
```

---
*Documento generado el 2026-05-06 para el despliegue de TAG Logística.*
