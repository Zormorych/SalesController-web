# Roadmap del frontend

Pantallas en el mismo orden en que se construyó el backend ([ROADMAP del backend](https://github.com/Zormorych/SalesController/blob/main/docs/ROADMAP.md)). Una rama y un PR por paso.

## Convenciones

- **Una carpeta por apartado** en `src/app/features/`, con sus modelos (`*.models.ts`), su servicio de API (`*.service.ts`) y sus componentes. Lo común va en `src/app/core/` (llamadas que usa toda la app) y `src/app/shared/` (componentes reutilizables).
- **Modelos escritos a mano** en TypeScript, a partir del Swagger del backend (`/v3/api-docs`). Los importes llegan como número y se muestran con el `currency` de Angular en español: `1.234,50 €`.
- **Listados** con tablas de Angular Material. **Altas y ediciones** en diálogos con formularios reactivos, cuyas validaciones son las mismas que las del backend.
- **Errores:** un interceptor HTTP muestra en un aviso inferior el `detail` en español del `ProblemDetail` que devuelve el backend (404, 409, 400…).
- **Pantallas pensadas también para el móvil:** el menú lateral se pliega en pantallas estrechas.
- **Tests** con Vitest: servicios con `HttpTestingController` y componentes con su HTML.

## Pasos

| Paso | Rama                      | Pantallas                                                                                                                                                         | API del backend                                                          |
| ---- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 0    | `main`                    | Base: Angular, Material, proxy, CI, comprobación del backend                                                                                                      | `/api/health`                                                            |
| 1    | `feature/catalog`         | Estructura común (menú, avisos de error) y **catálogo**: productos y personalizaciones con precio de venta, coste y beneficio; alta, edición y activar/desactivar | `/api/catalog/*`                                                         |
| 2    | `feature/customers`       | **Clientes**: listado con búsqueda, alta y edición                                                                                                                | `/api/customers`                                                         |
| 3    | `feature/orders`          | **Pedidos**: listado, alta con varias camisetas y personalizaciones (precios editables), detalle con totales y progreso, editar y cancelar                        | `/api/sales/orders`                                                      |
| 4    | `feature/payments`        | **Cobros** dentro del pedido: lo cobrado y lo pendiente, registrar y anular                                                                                       | `/api/sales/orders/{id}/payments`                                        |
| 5    | `feature/batches`         | **Lotes al fabricante**: camisetas pendientes, crear lote (envío por defecto 4,00 €), detalle con reparto del envío, enviar, cancelar y **descargar el Excel**    | `/api/purchasing/*`                                                      |
| 6    | `feature/receive-deliver` | **Recepción y entrega**: recibir un lote marcando las que no llegan, llegada tardía, entregar camisetas                                                           | `/api/purchasing/batches/{id}/receive`, `/api/sales/orders/{id}/deliver` |
| 7    | `feature/reports`         | **Informes**: resumen por periodo, beneficio por lote y trabajo pendiente                                                                                         | `/api/reports/*`                                                         |
| 8    | `feature/resale`          | **Stock y reventa**: prendas, venta y deshacer venta, pasar a stock una camiseta del pedido                                                                       | `/api/resale/items`                                                      |
