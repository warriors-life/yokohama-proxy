# Warriors Life NGINX Proxy
This is the configuration of the NGINX reverse proxy for Warriors Life.

## License
See the [LICENSE](LICENSE) file.

## TODO
- [ ] TODOs in configuration files.
- [ ] Convert configuration to config maps?
- [ ] Possibly use NGINX Ingress controller instead of NGINX container?
- [ ] Consider splitting into mulitple NGINX instances (one managing load balancing and rate limiting, others managing more complex stuff)?

## Documentation
The NGINX configuration presented in this repository manages SSL, compression (on-the-fly, not static), caching, cookie flags, headers (except for some headers coming from backends), proxying to backends and load balancing, and basic rate limiting.

The configuration uses the following environment variables for controlling it:
- `$NGINX_DOMAIN_NAME` - the domain name of the website.
- `$NGINX_REPORT_URL` - URL (absolute), to which error reports are send (such as from `Report-Endpoints` header).
- `$NGINX_RESOLVER` - seeds the NGINX [`resolver`](https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver) directive.
- `$NGINX_MAIN_BACKEND`, `$NGINX_CHAT_BACKEND`, and `$NGINX_GAME_BACKEND` - IP addresses or domain names (potentially with ports) of Warriors Life main backend, chat backend, and game backend.
- `$NGINX_ERROR_BAD_REQUEST`, `$NGINX_ERROR_FORBIDDEN`, `$NGINX_ERROR_NOT_FOUND`, `$NGINX_ERROR_TOO_LARGE`, `NGINX_ERROR_TOO_EARLY`, `$NGINX_ERROR_TOO_MANY_REQUESTS`, `$NGINX_ERROR_INTERNAL`, and `$NGINX_ERROR_SERVICE_UNAVAILABLE` - URLs (relative) of 400 and 405, 403, 404 and 416, 413 and 414 and 431, 425 (returned as 400), 429, 500, 502 and 503 and 504 (returned as 503) error pages.
- `$NGINX_CHAT_WEBSOCKET_URL` and `$NGINX_GAME_WEBSOCKET_URL` - URLs (relative), on which a client can connect to chat and game backends via WebSockets.
- `$NGINX_CERT`, `$NGINX_CERT_KEY`, `$NGINX_DH_PARAMS`, and `$NGINX_TRUSTED_CERTS` - paths to SSL certificate, SSL certificate key, Diffie-Hellman parameters, and trusted CA certificates file.
- `$NGINX_DUMPS` - directory, where NGINX places crash dumps.
- `$NGINX_STATIC` - directory, where static files (gzipped, brotlied, and empty originals) are located.
- `$NGINX_AUTH_REALM` - authentication realm for HTTP Basic Authentication (enabled on all requests). Set to `off` to disable.
- `$NGINX_AUTH_USERS` - path to users and passwords file used for authentication.

Following environment variables are set in Dockerfile, but can be changed:
- `$NGINX_USER` - the user that NGINX uses, defaults to `nginx`.
- `$NGINX_ACCESS_LOG` and `$NGINX_ERROR_LOG` - files where NGINX logs requests and errors, default to `/var/log/nginx/access.log` and `/var/log/nginx/error.log`, which are symbolic links to `stdout` and `stderr`.
- `$NGINX_ENVSUBST_TEMPLATE_DIR` - directories, where template NGINX configs are placed (final configs are placed in `/etc/nginx`), defaults to `/nginx-configs-templates`.

The following is expected from the backends:
- Correctly respond to GET, HEAD, and POST requests to dynamic resources (`$NGINX_MAIN_BACKEND`) and WebSocket requests to WebSocket resources (`$NGINX_CHAT_BACKEND` and `$NGINX_GAME_BACKEND`).
- Correctly manage TLS Early Data by preventing request resubmission (processing the `Early-Data` header passed).
- Correctly process `Origin` and `Referer` headers (preventing requests that shouldn't come from external sites).
- Correctly manage application-level rate-limiting.
- Correctly manage `ETag` and `If-None-Match` headers for cacheable resources. Cacheable resources should also return correct `Cache-Control` header (uncacheable should return the `Cache-Control` header passed).
- Correctly manage `Content-Disposition`/`Language`/`Length`/`Type` headers. Note that `Content-Encoding` is not included (NGINX will gzip or brotli the response itself provided `Content-Type` is compressable).
- Correctly process `Accept-Language` header.
- Correctly manage `Content-Security`/`Permissions`/`Document`/`Feature-Policy` headers (with the defaults being those passed from the proxy).
- Correctly manage `Vary` header.
- Correctly manage `Link` headers for doing resources preloading.
- Properly manage CORS and `Server-Timing` headers.
- Properly manage Client Hints headers.
- Properly manage `Clear-Site-Data` header.
- Provide an endpoint at `$NGINX_REPORT_URL` for sending error and violation reports.
- Return only 101, 200, 204, 206, 304, 400, 403, 404, 413, 414, 416, 425, 426, 429, 431, 500, 503 HTTP status codes.

The following is expected from the configuration done by environment variables:
- Provide an endpoint at `$NGINX_REPORT_URL` for sending error and violation reports.
- Provide a trusted DNS resolver at `$NGINX_RESOLVER`, being able to resolve OCSP stampling server and `$NGINX_MAIN_BACKEND`, `$NGINX_CHAT_BACKEND`, and `$NGINX_GAME_BACKEND`'s IPs.
- Provide error pages at `$NGINX_ERROR_BAD_REQUEST`, `$NGINX_ERROR_FORBIDDEN`, `$NGINX_ERROR_NOT_FOUND`, `$NGINX_ERROR_TOO_LARGE`, `NGINX_ERROR_TOO_EARLY`, `$NGINX_ERROR_TOO_MANY_REQUESTS`, `$NGINX_ERROR_INTERNAL`, and `$NGINX_ERROR_SERVICE_UNAVAILABLE`.
- Provide correct SSL files at `$NGINX_CERT`, `$NGINX_CERT_KEY`, `$NGINX_DH_PARAMS`, and `$NGINX_TRUSTED_CERTS`, including OCSP server URL and [signed certificate timestamps (SCTs)](https://en.wikipedia.org/wiki/Certificate_Transparency).
- Provide static files in `$NGINX_STATIC`, including empty files with their original names and their gzipped versions.
- Provide correct .htpasswd file at `$NGINX_AUTH_USERS` if `NGINX_AUTH_REALM` is not `off`.
- Make sure all needed files and directories are readable and/or writable. <!--- # TODO: List them (FEAT) -->

The proxy guranteed to do:
- Work for Chrome 41+, Edge 18+, Safari 14+, Firefox 65+, Opera 28+.
- Manage GET requests for static files (optionally with BLAKE3 hash appended to name), WebSocket requests for WebSocket URLs (`$NGINX_CHAT_WEBSOCKET_URL` and `$NGINX_GAME_WEBSOCKET_URL`), GET and POST requests for dynamic resources.
- Manage SSL.
- Manage on-the-fly GZIP compression and serving pre-gzipped files.
- Manage caching.
- Manage cookie flags.
- Manage headers.
- Basic load balancing.
- Rate limiting.
