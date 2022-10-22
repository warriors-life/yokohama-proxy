# syntax=docker/dockerfile:1.4.3
FROM nginx:1.23.2-alpine

LABEL maintainer="Warriors Life <info@warriorslife.site>"

ENV NGINX_TEMPLATES_PATH=/nginx-configs-templates
ENV NGINX_CONFIGS_PATH=/nginx-configs

ENV NGINX_ACCESS_LOG=/var/log/nginx/access.log
ENV NGINX_ERROR_LOG=/var/log/nginx/error.log

ENV NGINX_DOMAIN_NAME=warriorslife.site

ENV NGINX_USER=nginx

RUN rm -f /usr/local/bin/envsubst

RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh && rm -f /docker-entrypoint.d/20-envsubst-on-templates.sh
COPY --link 20-envsubst.sh /docker-entrypoint.d

COPY --link *.conf $NGINX_TEMPLATES_PATH

RUN ln -sf /dev/stdout $NGINX_ACCESS_LOG && ln -sf /dev/stderr $NGINX_ERROR_LOG

EXPOSE 80 443

HEALTHCHECK CMD ["service", "nginx", "status"]

# TODO: use read-only NGINX? (FEAT)
# TODO: use unprivileged NGINX? (FEAT)

# TODO: FIPS check (based on nginx-plus-module-fips-check and https://docs.nginx.com/nginx/fips-compliance-nginx-plus/)