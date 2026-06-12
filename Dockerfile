# Estágio 1: build da aplicação Vue 3 + Vite
FROM node:22-alpine AS build

WORKDIR /app

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio 2: servir arquivos estáticos com Caddy
FROM caddy:2-alpine AS production

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
