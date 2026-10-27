# SalesController · Frontend

Frontend Angular de [SalesController](https://github.com/Zormorych/SalesController): pedidos de camisetas, lotes al fabricante, cobros, stock y reventa, e informes. Consume la API REST del backend.

## Tecnología

- Angular 22 (componentes _standalone_, _signals_, sin `zone.js`)
- Angular Material (Material 3)
- Vitest para los tests, ESLint (angular-eslint) y Prettier
- Formato español: fechas, números e importes como `1.234,50 €`

## Requisitos

- Node.js 24 (o 22.22+) y npm
- El backend arrancado. Con Docker, desde el repositorio del backend:

  ```bash
  APP_PORT=8081 docker compose up -d --build
  ```

## Arrancar en local

```bash
npm install
npm start
```

Abre http://localhost:4200. La página de inicio indica si el backend responde.

En desarrollo, las llamadas a `/api` se redirigen al backend en `http://localhost:8081` (`proxy.conf.json`). Así el navegador no necesita CORS. Si el backend está en otro puerto, cambia el `target` de ese fichero.

## Arrancar con Docker (front y back por separado)

El frontend se compila y lo sirve **nginx** dentro de un contenedor. nginx también pasa las llamadas a `/api` al backend, así que el navegador solo habla con él y no hace falta CORS.

1. **Backend**, desde su repositorio, publicando el puerto 8081 (en este equipo el 8080 está ocupado):

   ```powershell
   $env:APP_PORT = '8081'; docker compose up -d --build
   ```

2. **Frontend**, desde este repositorio:

   ```bash
   docker compose up -d --build
   ```

3. Abre http://localhost:4200. Desde el móvil, conectado al mismo wifi: `http://<IP del PC>:4200`. La IP sale con `ipconfig`; la primera vez Windows puede preguntar si permite el acceso por el cortafuegos.

Para cambiar los puertos o la dirección del backend, copia `.env.example` como `.env`. Para pararlo: `docker compose down`.

**Los datos no se pierden:** viven en la base de datos del backend, en un volumen de Docker. Sobreviven a `docker compose down`, a reconstruir las imágenes y a reiniciar el PC. Solo se borran con `docker compose down -v`, o borrando el volumen a mano. Para hacer copias de seguridad, mira el README del backend.

## Scripts

| Comando                | Qué hace                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `npm start`            | Servidor de desarrollo con recarga automática                                        |
| `npm test`             | Tests con Vitest (en modo vigilancia; añade `-- --watch=false` para una sola pasada) |
| `npm run lint`         | ESLint                                                                               |
| `npm run format`       | Formatea el código con Prettier                                                      |
| `npm run format:check` | Comprueba el formato sin cambiar nada (lo usa la CI)                                 |
| `npm run build`        | Compila para producción en `dist/`                                                   |

## Estructura

```text
src/app/
├── core/          ← servicios comunes (llamadas a la API que usa toda la aplicación)
│   └── health/
├── features/      ← una carpeta por apartado: home, pedidos, lotes, cobros, stock, informes…
│   └── home/
├── app.config.ts  ← configuración global: rutas, HTTP, idioma y moneda
└── app.routes.ts  ← rutas; cada página se carga solo al visitarla
```

## CI

GitHub Actions en cada push, por etapas: **Lint y formato** → **Tests** → **Compilar** e **Imagen Docker** (en paralelo). La aplicación compilada queda como artefacto del pipeline. La imagen solo se construye para comprobar que el Dockerfile funciona; no se publica.
