# Yokohama Proxy
Yokohama Proxy is a Docker image based on NGINX for working as a reverse proxy.

Yokohama Proxy is a part of the Yokohama Project, stay tuned for its other components!

## License
See the [LICENSE](LICENSE) file.

## TODO
- [ ] TODOs in configuration files.
- [ ] Convert configuration to config maps?
- [ ] Possibly use NGINX Ingress controller instead of NGINX container?
- [ ] Consider splitting into mulitple NGINX instances (one managing load balancing and rate limiting, others managing more complex stuff)?

## Documentation
Yokohama Proxy manages SSL, compression (on-the-fly, not static), caching, cookie flags, headers (except for some headers coming from backends), proxying to backends and load balancing, and basic rate limiting.

Yokohama Proxy uses the following environment variables for controlling it:
- `$NGINX_DOMAIN_NAME` - the domain name of the website.
- `$NGINX_REPORT_URL` - URL (absolute), to which error reports are send (such as from `Report-Endpoints` header).
- `$NGINX_RESOLVER` - seeds the NGINX [`resolver`](https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver) directive.
- `$NGINX_BACKEND` - IP address or domain name (potentially with port) of the main backend used.
- `$NGINX_ERROR_BAD_REQUEST`, `$NGINX_ERROR_FORBIDDEN`, `$NGINX_ERROR_NOT_FOUND`, `$NGINX_ERROR_TOO_LARGE`, `NGINX_ERROR_TOO_EARLY`, `$NGINX_ERROR_TOO_MANY_REQUESTS`, `$NGINX_ERROR_INTERNAL`, and `$NGINX_ERROR_SERVICE_UNAVAILABLE` - URLs (relative) of 400 and 405, 403, 404 and 416, 413 and 414 and 431, 425 (returned as 400), 429, 500, 502 and 503 and 504 (returned as 503) error pages.
- `$NGINX_WEBSOCKETS` - a JSON object specifying an array of arrays containing three elements, which are a WebSocket resource name, the regexp for URL (relative) where it can be accessed, and its backend (IP address or domain name, potentially with port).
- `$NGINX_CERT`, `$NGINX_CERT_KEY`, `$NGINX_DH_PARAMS`, and `$NGINX_TRUSTED_CERTS` - paths to SSL certificate, SSL certificate key, Diffie-Hellman parameters, and trusted CA certificates file.
- `$NGINX_DUMPS` - directory, where NGINX places crash dumps.
- `$NGINX_STATIC` - directory, where static files (gzipped, brotlied, and empty originals) are located.
- `$NGINX_AUTH_REALM` - authentication realm for HTTP Basic Authentication (enabled on all requests). Set to `off` to disable.
- `$NGINX_AUTH_USERS` - path to users and passwords file used for authentication.
- `$NGINX_WORKER_RLIMIT_NOFILE`, `$NGINX_WORKER_RLIMIT_CORE`, `$NGINX_WORKER_PROCESSES`, `$NGINX_WORKER_CONNECTIONS`, `$NGINX_WORKER_AIO_REQUESTS`, `$NGINX_MULTI_ACCEPT`, `$NGINX_POSTPONE_OUTPUT`, `$NGINX_SENDFILE_MAX_CHUNK`, `$NGINX_DIRECTIO_MIN_SIZE`, `$NGINX_THREAD_POOL_SIZE`, `$NGINX_THREAD_POOL_MAX_QUEUE`, `$NGINX_OUTPUT_BUFFERS_NUM`, `$NGINX_OUTPUT_BUFFERS_SIZE`, `$NGINX_OPEN_FILE_CACHE_MAX_SIZE`, `$NGINX_OPEN_FILE_CACHE_INACTIVE`, `$NGINX_OPEN_FILE_CACHE_MIN_USES`, `$NGINX_OPEN_FILE_CACHE_VALID`, `$NGINX_UPSTREAM_KEEPALIVE_CONNECTIONS`, `$NGINX_UPSTREAM_KEEPALIVE_REQUESTS`, `$NGINX_UPSTREAM_KEEPALIVE_TIME`, `$NGINX_UPSTREAM_KEEPALIVE_TIMEOUT`, `$NGINX_KEEPALIVE_REQUESTS`, `$NGINX_KEEPALIVE_TIME`, `$NGINX_KEEPALIVE_TIMEOUT`, `$NGINX_RESOLVER_TIMEOUT`, `$NGINX_LINGERING_TIME`, `$NGINX_LINGERING_TIMEOUT`, `$NGINX_GZIP_COMP_LEVEL`, `$NGINX_GZIP_NUM_BUFFERS`, `$NGINX_GZIP_BUFFER_SIZE`, `$NGINX_GZIP_MIN_LENGTH`, `$NGINX_SSL_SESSION_TIMEOUT`, `$NGINX_SSL_SESSION_CACHE_SIZE`, `$NGINX_UPSTREAM_ZONE_SIZE`, `$NGINX_PROXY_CONNECT_TIMEOUT`, `$NGINX_PROXY_READ_TIMEOUT`, `$NGINX_PROXY_SEND_TIMEOUT`, `$NGINX_PROXY_CACHE_LOCK_AGE`, `$NGINX_PROXY_CACHE_LOCK_TIMEOUT`, `$NGINX_PROXY_CACHE_KEYS_ZONE_SIZE`, `$NGINX_PROXY_CACHE_INACTIVE`, `$NGINX_PROXY_CACHE_MAX_SIZE`, `$NGINX_LIMIT_RATE`, `$NGINX_LIMIT_RATE_AFTER`, `$NGINX_LIMIT_CONN`, `$NGINX_LIMIT_REQ_RATE`, `$NGINX_RETRY_AFTER`, `$NGINX_AUTH_DELAY` - a bunch of variables controlling miscellaneous configuration parameters and choices.

Following environment variables are set in Dockerfile, but can be changed:
- `$NGINX_STATIC_IMMUTABLE_REGEXP`, `$NGINX_STATIC_MUTABLE_REGEXP`, and `$NGINX_DYNAMIC_REGEXP` - the regexps for detecting whether a given URL (relative) is a static immutable file, static mutable file, or dynamic file. Default to `^((?:/[\w-]+)+)-[0-9a-f]{64}(\.[a-z0-9]+)$` (filename-32bytehash.extension), `^((?:/[\w-]+)+)(\.[a-z0-9]+)$` (filename.extension), and `^((?:/[\w-]+)+|/)$` (filename or `/`).
- `$NGINX_USER` - the user that NGINX uses, defaults to `nginx`.
- `$NGINX_ACCESS_LOG` and `$NGINX_ERROR_LOG` - files where NGINX logs requests and errors, default to `/var/log/nginx/access.log` and `/var/log/nginx/error.log`, which are symbolic links to `stdout` and `stderr`.
- `$NGINX_NJK_TEMPLATE_DIR` - directories, where template NGINX configs are placed (final configs are placed in `/etc/nginx`), defaults to `/nginx-configs-templates`.

The following is expected from the backends:
- Correctly respond to GET, HEAD, and POST requests to dynamic resources (`$NGINX_BACKEND`) and WebSocket requests to WebSocket resources (`$NGINX_WEBSOCKETS`).
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
- Return only 101, 103, 200, 204, 206, 304, 400, 403, 404, 413, 414, 416, 425, 426, 429, 431, 500, 503 HTTP status codes.

The following is expected from the configuration done by environment variables:
- Provide an endpoint at `$NGINX_REPORT_URL` for sending error and violation reports.
- Provide a trusted DNS resolver at `$NGINX_RESOLVER`, being able to resolve OCSP stampling server, `$NGINX_BACKEND`'s IP, and IPs of WebSocket backends.
- Provide error pages at `$NGINX_ERROR_BAD_REQUEST`, `$NGINX_ERROR_FORBIDDEN`, `$NGINX_ERROR_NOT_FOUND`, `$NGINX_ERROR_TOO_LARGE`, `NGINX_ERROR_TOO_EARLY`, `$NGINX_ERROR_TOO_MANY_REQUESTS`, `$NGINX_ERROR_INTERNAL`, and `$NGINX_ERROR_SERVICE_UNAVAILABLE`.
- Provide correct SSL files at `$NGINX_CERT`, `$NGINX_CERT_KEY`, `$NGINX_DH_PARAMS`, and `$NGINX_TRUSTED_CERTS`, including OCSP server URL and [signed certificate timestamps (SCTs)](https://en.wikipedia.org/wiki/Certificate_Transparency).
- Provide static files in `$NGINX_STATIC`, including empty files with their original names and their gzipped versions.
- Provide correct .htpasswd file at `$NGINX_AUTH_USERS` if `NGINX_AUTH_REALM` is not `off`.
- Make sure all needed files and directories are readable and/or writable. <!--- # TODO: List them (FEAT) -->

Yokohama Proxy is guranteed to:
- Work on amd64 and arm64 architectures.
- Work on Linux 4.5+ servers (for example, Debian 9+, Ubuntu 16.10+, RHEL 8+, or Fedora 24+).
- Work for clients running Chrome 32+, Edge 18+, Safari 14+, Firefox 65+, Opera 20+, Samsung Internet 5+ browsers on Windows 7+, Android 4.4.2+, macOS 11+, and generally all Linuxes with OpenSSL 1.0.1+ installed.
- Manage GET requests for static files, WebSocket requests for WebSocket resources, GET and POST requests for dynamic resources.
- Manage SSL.
- Manage on-the-fly GZIP compression and serving pre-gzipped files.
- Manage caching.
- Manage cookie flags.
- Manage headers.
- Do basic load balancing.
- Do rate limiting.
