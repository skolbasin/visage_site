FROM node:22-alpine AS builder

WORKDIR /app

# Даём права на выполнение командам
RUN chmod +x $(which npm) 2>/dev/null || true

COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com

COPY . .

# Даём права на выполнение для всех бинарников в node_modules
RUN chmod +x node_modules/.bin/* 2>/dev/null || true

# Запускаем сборку через npm (не npx)
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]