# syntax=docker/dockerfile:1.4.3
FROM nginx:1.23.2-alpine

LABEL maintainer="Warriors Life <info@warriorslife.site>"

ENV NGINX_ENVSUBST_FILTER=NGINX_

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/nginx-configs-templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/nginx-configs

ENV NGINX_ACCESS_LOG=/var/log/nginx/access.log
ENV NGINX_ERROR_LOG=/var/log/nginx/error.log

ENV NGINX_DOMAIN_NAME=warriorslife.site

ENV NGINX_USER=nginx

# hadolint ignore=SC2016
RUN ln -sf /dev/stdout $NGINX_ACCESS_LOG && ln -sf /dev/stderr $NGINX_ERROR_LOG && \
    rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh && \
	sed -i '/exit 0/i mv -f $NGINX_ENVSUBST_OUTPUT_DIR/nginx.conf /etc/nginx' /docker-entrypoint.d/20-envsubst-on-templates.sh

COPY --link *.conf $NGINX_ENVSUBST_TEMPLATE_DIR

EXPOSE 80 443

HEALTHCHECK CMD ["service", "nginx", "status"]

# TODO: use read-only NGINX? (FEAT)
# TODO: use unprivileged NGINX? (FEAT)

# TODO: FIPS check (based on nginx-plus-module-fips-check and https://docs.nginx.com/nginx/fips-compliance-nginx-plus/) (FEAT)