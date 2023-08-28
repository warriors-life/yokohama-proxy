# Contribution
Thank you for deciding to contribute a feature or bug fix to Yokohama Proxy! Please read the following to get started.

## Installation
Latest dev version:
```sh
docker pull ghcr.io/warriors-life/yokohama-proxy:dev
```

Latest release version:
```sh
docker pull ghcr.io/warriors-life/yokohama-proxy:latest
```

Building from source:
```sh
docker build --tag your-test-tag src
```

## Running tests
Running unit tests:
```sh
cd test
export $(sed '/^[[:blank:]]*#/d;s/#.*//' test.env | xargs -0)
openssl req -x509 -config ssl-config/openssl-ca.conf -out server$NGINX_TRUSTED_CERTS -keyout ssl-config/ca.key -noenc
openssl req -config ssl-config/openssl-cert.conf -CA server$NGINX_TRUSTED_CERTS -CAkey ssl-config/ca.key -out server$NGINX_CERT -keyout server$NGINX_CERT_KEY -noenc
gzip -k server/static/*.{css,csv,html,ico,js,json,svg,txt,wasm,webmanifest}
cd server && docker compose up -d && cd ..
npm run test
```

Running `nginx -t` test (configuration test):
```sh
cd test
export $(sed '/^[[:blank:]]*#/d;s/#.*//' test.env | xargs -0)
openssl req -x509 -config ssl-config/openssl-ca.conf -out server$NGINX_TRUSTED_CERTS -keyout ssl-config/ca.key -noenc
openssl req -config ssl-config/openssl-cert.conf -CA server$NGINX_TRUSTED_CERTS -CAkey ssl-config/ca.key -out server$NGINX_CERT -keyout server$NGINX_CERT_KEY -noenc
docker run --rm --env-file test.env --mount type=bind,src="$(pwd)"/server/ssl,dst=/ssl,ro your-test-tag nginx -t
```

Running [Gixy](https://github.com/dvershinin/gixy) test (configuration linter):
```sh
cd test
docker run --rm --env-file test.env --mount type=volume,src=nginx-conf,dst=/etc/nginx your-test-tag nginx -v
docker run --rm --mount type=volume,src=nginx-conf,dst=/etc/nginx,ro getpagespeed/gixy:v0.1.22@sha256:3721944f812a94f4de0f92e0e31d938381abd6fed1f8f64a5cd7abddf063012b
```

It may be useful to inspect proxy logs or NGINX configuration files in Docker Desktop.

## Preparing PR
It is suggested that you add unit tests if you are adding a new functionality or fix a bug. Please also update [changelog](CHANGELOG.md).

## Sending PR
You can do this [on GitHub](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).