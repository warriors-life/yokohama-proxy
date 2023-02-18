# Warriors Life NGINX Proxy
This is the configuration of the NGINX reverse proxy for Warriors Life.

## License
See the [LICENSE](LICENSE) file.

## TODO
- [ ] TODOs in configuration files.
- [ ] Convert configuration to config maps?
- [ ] Possibly use NGINX Ingress controller instead of NGINX container?

## Documentation
The NGINX configuration presented in this repository manages SSL, compression (on-the-fly, not static), cache, cookie flags, headers (except for some headers coming from backends), proxying to backends and load balancing, and basic rate limiting.

The configuration uses the following environment variables to control NGINX:
- `$NGINX_REPORT_URL` - URL (absolute), to which error reports are send (such as from `Report-Endpoints` header).
- `$NGINX_CERT`, `$NGINX_CERT_KEY`, `$NGINX_DH_PARAMS`, and `$NGINX_TRUSTED_CERTS` - paths where SSL certificate, SSL certificate key, Diffie-Hellman parameters, and trusted CA certificates are located.
- `$NGINX_RESOLVER` - seeds the NGINX [`resolver`](https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver) directive.
- `$NGINX_MAIN_BACKEND`, `$NGINX_CHAT_BACKEND`, and `$NGINX_GAME_BACKEND` - IP addresses or domain names (potentially with ports) of Warriors Life main backend, chat backend, and game backend.
- `$NGINX_ERROR_BAD_REQUEST`, `$NGINX_ERROR_FORBIDDEN`, `$NGINX_ERROR_NOT_FOUND`, `$NGINX_ERROR_TOO_LARGE`, `$NGINX_ERROR_TOO_MANY_REQUESTS`, `$NGINX_ERROR_INTERNAL`, and `$NGINX_ERROR_SERVICE_UNAVAILABLE` - URLs (relative) of 400 and 405, 403, 404, 413 and 414 and 431, 429, 500, 502 and 503 and 504 error pages.
- `$NGINX_CHAT_WEBSOCKET_URL` and `$NGINX_GAME_WEBSOCKET_URL` - URLs (relative), on which a client can connect to chat and game backends via WebSockets.
- `$NGINX_DUMPS_PATH` - directory, where NGINX places crash dumps.
- `$NGINX_STATIC_DIR` - directory, where static files (gzipped, brotlied, and empty originals) are located.

Following environment variables are set in Dockerfile, but can be changed:
- `$NGINX_DOMAIN_NAME` - the domain name of the website, defaults to `warriorslife.site`.
- `$NGINX_USER` - the user that NGINX uses, defaults to `nginx`.
- `$NGINX_ACCESS_LOG` and `$NGINX_ERROR_LOG` - files where NGINX logs requests and errors, default to `/var/log/nginx/access.log` and `/var/log/nginx/error.log`, which are symbolic links to `stdout` and `stderr`.
- `$NGINX_ENVSUBST_TEMPLATE_DIR` - directories, where template NGINX configs are placed (final configs are placed in `/etc/nginx`), defaults to `/nginx-configs-templates`.
