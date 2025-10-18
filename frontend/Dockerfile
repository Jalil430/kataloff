# === Stage 1: Build React app ===
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# === Stage 2: Serve with nginx ===
FROM nginx:stable-alpine

# удаляем дефолтную конфигурацию nginx
RUN rm -rf /usr/share/nginx/html/*

# копируем сборку
COPY --from=build /app/dist /usr/share/nginx/html

# добавляем конфиг, чтобы всё SPA работало корректно
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
