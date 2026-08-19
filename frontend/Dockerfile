# Multi-stage frontend build.
# Participants run the final nginx stage (~90MB, static production
# bundle). Maintainers run the "dev" stage via docker-compose.dev.yml
# (CRA dev server with hot reload).

# --- dev: CRA dev server (docker-compose.dev.yml targets this stage) ---
# node 24 = npm 11, matching the toolchain that writes package-lock.json
# (npm 10 rejects this lock's optional-peer entries under `npm ci`)
FROM node:24-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 3000

CMD ["npm", "start"]

# --- build: static production bundle ---
FROM dev AS build

COPY . .
RUN npm run build

# --- final: nginx serving the bundle ---
FROM nginx:alpine

# The app is a single page (no client-side routing), so the default
# nginx config is sufficient. The API URL is compiled in (api.js:
# http://127.0.0.1:5001/api) - the browser talks to the backend
# container's published port directly.
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
