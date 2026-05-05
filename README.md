# TAG Logística - Core System

TAG Logística es una prueba de concepto (PoC) en arquitectura Monorepo que divide el sistema de gestión de transporte en una interfaz fluida de React sobre un motor API respaldado por Laravel.

## Arquitectura

- **Frontend (`/client`)**: React 18, Vite, Lucide-React V2, CSS nativo con Eye-Care Support (Modos Visuales).
- **Backend (`/api`)**: Laravel 11. Soporte PHP moderno y abstracción modular de base de datos.
- **Base de Datos**: MySQL 8.0 (Containerizada).
- **Virtualización**: Se administra el ecosistema integral usando contenedores a través de `docker-compose`.

---

## Montaje Fácil (Para una PC Nueva)

Se ha configurado un script especial `start.bat` inteligente. Ideal para lanzar rápidamente el proyecto enfrente del cliente en cualquier ordenador sin configurar herramientas de dependencia a mano.

### Requisitos Iniciales:
1. Tener [Git](https://git-scm.com/) instalado.
2. Tener [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y **abierto/funcionando**.

### Ejecución:
Si recibe este proyecto vacío, lo único que necesita hacer es doble clic en:
`start.bat`

El propio script automatizado detectará carencias e inciará:
1. Una clonación del repositorio central de GitHub (si el ordenador no tiene los archivos).
2. Verificará y bajará mediante contenedores aislados las dependencias de Node.js (`npm install`).
3. Verificará dependencias de PHP (`composer install`).
4. Duplicará variables de entorno de ejemplo (`.env.example` -> `.env`).
5. Activará el ecosistema subyacente.
6. Aplicará la estructura en la base de datos MySQL (Levantará las `migrations`).

---

## Montaje Manual (Alternativa / macOS y Linux)

Si el instalador automatizado para Windows no resulta adecuado para su distribución o prefiere levantar los servicios artesanalmente:

**1. Clone la raíz:**
```bash
git clone <URL_REPOSITORIO_GITHUB> tag
cd tag
```

**2. Descargue Dependencias del Frontend:**
```bash
cd client
npm install
cd ..
```

**3. Descargue Dependencias del API y cree la config:**
```bash
cd api
composer install
cp .env.example .env
cd ..
```

**4. Orquestar Contenedores:**
```bash
# Lanzar MySQL, API Base y Front Node en backgrpund ("-d")
docker-compose up -d --build
```

**5. Inicialización Fundamental Interna de Laravel:**
Una vez en ejecución los contenedores, ejecutar la inyección de migración y la clave core:
```bash
docker-compose exec api php artisan key:generate
docker-compose exec api php artisan migrate
```

---

## Entradas Rápidas (Puntos de Acceso)

Finalizado el montaje dispondrá en su ambiente local de los siguientes ecosistemas de uso:

- **Frontend (Sistema para Usuarios finales)**: [http://localhost:5173](http://localhost:5173)
- **Backend (API JSON Core Server)**: [http://localhost:8000](http://localhost:8000)

> **Nota para Simulaciones Demo (PoC):** \
> El Login integrado en el Frontend actualmente carece de barreras Criptográficas reales. Permite acceder escribiendo cualquier set de caracteres en ambos campos a modo de demostración inmediata sin forzar al expositor a recordar un password.
