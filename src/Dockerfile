# syntax=docker/dockerfile:1.4.3
FROM nginx:1.23.2-alpine

LABEL maintainer="Warriors Life <info@warriorslife.site>"

RUN rm -f /usr/local/bin/envsubst

RUN apk add --no-cache nginx-plus-module-fips-check

RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh && rm -f /docker-entrypoint.d/20-envsubst-on-templates.sh
COPY --link 20-envsubst.sh /docker-entrypoint.d

COPY --link *.conf /nginx-configs-templates

ENV NGINX_ACCESS_LOG=/var/log/nginx/access.log
ENV NGINX_ERROR_LOG=/var/log/nginx/error.log
RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80 443

HEALTHCHECK CMD ["service", "nginx", "status"]

# TODO: use read-only NGINX? (FEAT)
# TODO: use unprivileged NGINX? (FEAT)