# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Clarify in README versions where proxy runs ([`3ba53b`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/3ba53b7edcfbe82ff7e5d8fca0acb2fec21f755e)).
- A TODO about redirecting unsupported browsers to a special page ([`ec9450`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/ec9450d16986088c757e3f6a746102eaea79beba)).
- WebSockets are now specified in a different way and support for overriding static/dynamic files URL regexps was added (https://github.com/warriors-life/warriors-life-nginx-proxy/pull/43).

### Changed
- Replace `envsubst` for templating with [`njk`](https://github.com/saghul/njk) (https://github.com/warriors-life/warriors-life-nginx-proxy/pull/41).
- Updated to NGINX 1.25.1 ([`0c23f4`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/0c23f46e1dd589f41a1ae7efa7cb695021710389)).
- Moved most tweakable parameters to environment variables (...).
- Some cleanup and refactoring (...).

### Removed
- A TODO about removing "Server: nginx" header entirely ([`01dc10`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/01dc10f6fc2bfe89fc00eca5da017fce4cdfe1b6)).
- Support for HTTP/2 Server Push for preloading ([`0c23f4`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/0c23f46e1dd589f41a1ae7efa7cb695021710389)).

## [0.0.1] - 2023-05-28

### Added
- Created this repository, moved NGINX configs here ([`360ebd`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/360ebdd3eb60d956dcb8954ce73e64c4498e8fd8)).
- Added `nginx -t` and Gixy tests ([`dccd9c`](https://github.com/warriors-life/warriors-life-nginx-proxy/commit/dccd9ca53d6ed98cb2c9ee99e3be2893e655d814)).
- Added some unit tests (https://github.com/warriors-life/warriors-life-nginx-proxy/pull/38).

[Unreleased]: https://github.com/warriors-life/warriors-life-nginx-proxy/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/warriors-life/warriors-life-nginx-proxy/releases/tag/v0.0.1
