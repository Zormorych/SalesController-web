# Imagen del frontend en dos etapas:
#   1) build: compila Angular con Node (la imagen final no lleva Node ni node_modules)
#   2) runtime: nginx sirve los ficheros compilados y pasa las llamadas /api al backend

FROM node:24-alpine AS build
WORKDIR /app
# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa y no las vuelve a descargar
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.28-alpine
# La imagen de nginx sustituye ${BACKEND_URL} en las plantillas de /etc/nginx/templates al arrancar
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/sales-controller-web/browser /usr/share/nginx/html
ENV BACKEND_URL=http://host.docker.internal:8081
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
