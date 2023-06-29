# syntax=docker/dockerfile:1.4.3
FROM nginx:1.25.1-alpine3.17-slim@sha256:3b29f9ec76a085552a6ad469b84711642b2421c7c44d2b765ca8d9e8fb25c4e8

LABEL maintainer="Warriors Life <info@warriorslife.site>"

ENV NGINX_NJK_TEMPLATE_DIR=/nginx-configs-templates
ENV NGINX_NJK_OUTPUT_DIR=/etc/nginx

ENV NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=true

ENV NGINX_ACCESS_LOG=/var/log/nginx/access.log
ENV NGINX_ERROR_LOG=/var/log/nginx/error.log

ENV NGINX_USER=nginx

	# Clear /etc/nginx directory
RUN rm -rf /etc/nginx && mkdir /etc/nginx && \
	# Link logs to stdout and stderr
	ln -sf /dev/stdout $NGINX_ACCESS_LOG && ln -sf /dev/stderr $NGINX_ERROR_LOG && \
	# Remove unneeded sntrypoint scripts
	rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh && rm -f /docker-entrypoint.d/20-envsubst-on-templates.sh && \
	# Remove unneeded packages
	apk del --no-network libintl tzdata && rm -f /usr/local/bin/envsubst && \
	# Build njk
	apkArch="$(cat /etc/apk/arch)" && tempDir="$(mktemp -d)" && chown nobody:nobody "$tempDir" && apk add --no-cache --virtual .build-deps gcc=12.2.1_git20220924-r4 make=4.3-r1 cmake=3.24.4-r0 libc-dev=0.7.2-r3 git=2.38.5-r0 && su nobody -s /bin/sh -c "export HOME=\"$tempDir\" && cd \"$tempDir\" && git clone --recursive --depth 1 --branch master https://github.com/saghul/njk && cd njk && make" && apk del --no-network .build-deps && mv "$tempDir/njk/build/njk-linux-$apkArch" /usr/local/bin/njk && rm -rf "$tempDir"

COPY --link 20-njk-on-templates.sh /docker-entrypoint.d/

COPY --link *.conf $NGINX_NJK_TEMPLATE_DIR/

EXPOSE 80 443

HEALTHCHECK CMD ["service", "nginx", "status"]

# TODO: use read-only NGINX? (FEAT)
# TODO: use unprivileged NGINX? (FEAT)

# TODO: FIPS check (based on nginx-plus-module-fips-check and https://docs.nginx.com/nginx/fips-compliance-nginx-plus/) (FEAT, NGINX-MOD)
# TODO: other NGINX Extras (https://nginx-extras.getpagespeed.com/)? (NGINX-MOD)
