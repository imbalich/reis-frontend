FROM node:22-alpine AS build

WORKDIR /fba_ui

RUN corepack enable && corepack prepare pnpm@10.12.4 --activate

COPY . .

RUN pnpm install \
    && pnpm build

FROM nginx:1.27-alpine

COPY scripts/deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /fba_ui/apps/web-antd/dist /var/www/fba_ui

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]