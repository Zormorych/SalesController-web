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

GitHub Actions en cada push, por etapas: **Lint y formato** → **Tests** → **Compilar**. La aplicación compilada queda como artefacto del pipeline.
