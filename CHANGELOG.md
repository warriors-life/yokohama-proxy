# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Respond with 403 error code instead of 400 on POST requests with invalid referrers (...).
- Update to NGINX 1.25.2 (...).

### Fixed
- Fix `Reporting-Endpoints` header incorrectly named as `Report-Endpoints` (...).

## [0.1.0] - 2023-07-10

### Added
- Clarify in README versions where proxy runs ([`3ba53b7`](https://github.com/warriors-life/yokohama-proxy/commit/3ba53b7edcfbe82ff7e5d8fca0acb2fec21f755e)).
- A TODO about redirecting unsupported browsers to a special page ([`ec9450d`](https://github.com/warriors-life/yokohama-proxy/commit/ec9450d16986088c757e3f6a746102eaea79beba)).
- WebSockets are now specified in a different way and support for overriding static/dynamic files URL regexps was added (https://github.com/warriors-life/yokohama-proxy/pull/43).

### Changed
- Replace `envsubst` for templating with [`njk`](https://github.com/saghul/njk) (https://github.com/warriors-life/yokohama-proxy/pull/41).
- Update to NGINX 1.25.1 ([`0c23f46`](https://github.com/warriors-life/yokohama-proxy/commit/0c23f46e1dd589f41a1ae7efa7cb695021710389)).
- Move most tweakable parameters to environment variables (https://github.com/warriors-life/yokohama-proxy/pull/44).
- Some cleanup and refactoring (https://github.com/warriors-life/yokohama-proxy/pull/44).
- Rename to Yokohama Proxy ([`6f7a3ac`](https://github.com/warriors-life/yokohama-proxy/commit/ef7a3ac596c6be51f4f8bd4999aa1733bd0617a8)).
- Move some TODOs to Issues ([`9211603`](https://github.com/warriors-life/yokohama-proxy/commit/9211603a961eb39bb8c0984870f3df4be473840e)).
- Make the repository public.

### Removed
- A TODO about removing "Server: nginx" header entirely ([`01dc10f`](https://github.com/warriors-life/yokohama-proxy/commit/01dc10f6fc2bfe89fc00eca5da017fce4cdfe1b6)).
- Support for HTTP/2 Server Push for preloading ([`0c23f46`](https://github.com/warriors-life/yokohama-proxy/commit/0c23f46e1dd589f41a1ae7efa7cb695021710389)).

## [0.0.1] - 2023-05-28

### Added
- Created this repository, moved NGINX configs here ([`360ebdd`](https://github.com/warriors-life/yokohama-proxy/commit/360ebdd3eb60d956dcb8954ce73e64c4498e8fd8)).
- Added `nginx -t` and Gixy tests ([`dccd9ca`](https://github.com/warriors-life/yokohama-proxy/commit/dccd9ca53d6ed98cb2c9ee99e3be2893e655d814)).
- Added some unit tests (https://github.com/warriors-life/yokohama-proxy/pull/38).

[Unreleased]: https://github.com/warriors-life/yokohama-proxy/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/warriors-life/yokohama-proxy/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/warriors-life/yokohama-proxy/releases/tag/v0.0.1
