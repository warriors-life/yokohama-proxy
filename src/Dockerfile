# syntax=docker/dockerfile:1.4.3
FROM nginx:1.25.0-alpine-slim@sha256:571e8424ffec6d208ae90e6a917b1327c2e352317e09301c982d72031cd52cb8

LABEL maintainer="Warriors Life <info@warriorslife.site>"

ENV NGINX_ENVSUBST_FILTER=NGINX_
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/nginx-configs-templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx

ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=true

ENV NGINX_ACCESS_LOG=/var/log/nginx/access.log
ENV NGINX_ERROR_LOG=/var/log/nginx/error.log

ENV NGINX_USER=nginx

RUN rm -rf /etc/nginx && mkdir /etc/nginx \
    && ln -sf /dev/stdout $NGINX_ACCESS_LOG && ln -sf /dev/stderr $NGINX_ERROR_LOG \
    && rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

COPY --link *.conf.template $NGINX_ENVSUBST_TEMPLATE_DIR/

EXPOSE 80 443

HEALTHCHECK CMD ["service", "nginx", "status"]

# TODO: use read-only NGINX? (FEAT)
# TODO: use unprivileged NGINX? (FEAT)

# TODO: FIPS check (based on nginx-plus-module-fips-check and https://docs.nginx.com/nginx/fips-compliance-nginx-plus/) (FEAT, NGINX-MOD)
# TODO: other NGINX Extras (https://nginx-extras.getpagespeed.com/)? (NGINX-MOD)
