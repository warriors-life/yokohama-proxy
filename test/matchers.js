import {expect} from '@jest/globals';
import * as fs from 'fs/promises';

function formatOrString(values) {
	if (values.length === 2) return values[0] + ' or ' + values[1];
	return values.map((value, index) => (index === values.length - 1 ? 'or ' : '') + value).join(', ');
}

function dropCharset(type) {
	if (typeof type === 'string') {
		const index = type.indexOf(';')
		if (index !== -1) type = type.slice(index);
	}
	return type;
}

function toHaveStatus(res, statusCode) {
	const pass = res.status === statusCode;
	const message = () => `expected response to ${pass ? 'not ' : ''}have status code ${this.utils.printExpected(statusCode)}${pass ? '' : ', received ' + this.utils.printReceived(res.status)}`;
	return { message, pass };
}

function toBeFound(res) {
	return toHaveStatus.call(this, res, 200);
}

function toBeNotFound(res) {
	return toHaveStatus.call(this, res, 404);
}

function toBuffer(obj) {
	return obj instanceof Buffer ? obj : Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj));
}

function toHaveBody(res, body) {
	const resBuffer = toBuffer(res.text !== undefined ? res.text : res.body);
	const bodyBuffer = toBuffer(body);
	const pass = resBuffer.equals(bodyBuffer);
	const message = () => `expected response to ${pass ? 'not ' : ''}have body ${this.utils.printExpected(bodyBuffer)}${pass ? '' : ', received ' + this.utils.printReceived(resBuffer)}`;
	return { message, pass };
}

async function toHaveFileBody(res, file) {
	return toHaveBody.call(this, res, await fs.readFile(file));
}

function toHaveHeader(res, headerName, displayName = headerName, invert = false) {
	headerName = headerName.toLowerCase();

	const header = res.headers[headerName];
	const pass = (header !== undefined) !== invert;
	const message = () => `expected response to ${(header !== undefined) ? 'not ' : ''}have ${displayName} header${(header !== undefined) ? ', received "' + this.utils.printReceived(header) + '"' : ''}`;
	return { message, pass };
}

function toHaveCorrectHeader(res, headerName, target, displayName = headerName, logExpected = false) {
	headerName = headerName.toLowerCase();

	if (res._uncheckedHeaders === undefined) res._uncheckedHeaders = Object.keys(res.headers);
	const index = res._uncheckedHeaders.indexOf(headerName); if (index > -1) res._uncheckedHeaders.splice(index, 1);

	if (target === undefined) return toHaveHeader.call(this, res, headerName, displayName, true);
	if (target === null) return toHaveHeader.call(this, res, headerName, displayName);

	const header = res.headers[headerName];
	const isRegExp = target instanceof RegExp;
	const pass = isRegExp ? target.match(header) : header === String(target);
	const message = () => `expected response to have ${logExpected ? '' : (pass ? 'in' : '') + 'correct '}${displayName} header${logExpected ? ' "' + this.utils.printExpected(target) + '"' : ''}${pass && !isRegExp ? '' : ', received "' + this.utils.printReceived(header) + '"'}`;
	return { message, pass };
}

function toHaveCorrectHeaders(res, headers, displayNames = {}) {
	let resultMessage;

	for (const header of Object.keys(headers)) {
		const { message, pass } = toHaveCorrectHeader.call(this, res, header, headers[header], displayNames[header]);
		if (!pass && !resultMessage) resultMessage = message;
	}

	if (resultMessage) return { pass: false, message: resultMessage };

	return { pass: true, message: () => `expected response to have incorrect ${formatOrString(headers.map(header => displayNames[header] || header))} headers` };
}

function toRedirectTo(res, path, statusCode = 308) {
	const url = 'https://' + process.env.NGINX_DOMAIN_NAME + path;
	const { pass: passCode } = toHaveStatus.call(this, res, statusCode);
	const { pass: passLocation } = toHaveCorrectHeader.call(this, res, 'Location', url);
	const pass = passCode && passLocation;
	const message = () => `expected response to ${pass ? 'not ' : ''}redirect to ${this.utils.printExpected(url)}${pass ? '' : ', received status code ' + this.utils.printReceived(res.status) + ' and Location header ' + this.utils.printReceived(res.headers['location'])}`;
	return { pass, message };
}

function toHaveMimeType(res, type) {
	const isText = type.startsWith('text/') || type.includes('json') || type === 'application/javascript' || type === 'image/svg+xml';
	return toHaveCorrectHeader.call(this, res, 'Content-Type', type + (isText ? '; charset=utf-8' : ''), undefined, true);
}

function toHaveCorrectHSTSHeader(res) {
	return toHaveCorrectHeader.call(this, res, 'Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload', 'HSTS');
}

function toHaveCorrectServerHeader(res) {
	return toHaveCorrectHeader.call(this, res, 'Server', 'nginx');
}

function toBeUncacheable(res) {
	return toHaveCorrectHeaders.call(this, res, {
		'Cache-Control': 'no-store',
		'ETag': undefined
	});
}

function toRequireRevalidation(res) {
	return toHaveCorrectHeaders.call(this, res, {
		'Cache-Control': 'no-cache',
		'ETag': null
	});
}

function toBeImmutable(res) {
	return toHaveCorrectHeaders.call(this, res, {
		'Cache-Control': 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000, immutable',
		'ETag': undefined
	});
}

function toHaveDefaultPolicyHeaders(res) {
	const reportURL = process.env.NGINX_REPORT_URL;

	return toHaveCorrectHeaders.call(this, res, {
		'Content-Security-Policy': `default-src 'none'; upgrade-insecure-requests; report-uri ${reportURL}; report-to endpoint`,
		'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), gamepad=(), geolocation=(), gyroscope=(), interest-cohort=(), layout-animations=(), legacy-image-formats=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), oversized-images=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), speaker-selection=(), sync-xhr=(), unoptimized-images=(), unsized-media=(), usb=(), vr=(), wake-lock=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()',
		'Document-Policy': 'document-write=?0 *;report-to=endpoint',
		'Feature-Policy': "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; battery 'none'; camera 'none'; display-capture 'none'; document-domain 'none'; encrypted-media 'none'; execution-while-not-rendered 'none'; execution-while-out-of-viewport 'none'; fullscreen 'none'; gamepad 'none'; geolocation 'none'; gyroscope 'none'; layout-animations 'none'; legacy-image-formats 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; navigation-override 'none'; oversized-images 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-get 'none'; speaker-selection 'none'; sync-xhr 'none'; unoptimized-images 'none'; unsized-media 'none'; usb 'none'; vr 'none'; wake-lock 'none'; screen-wake-lock 'none'; web-share 'none'; xr-spatial-tracking 'none'"
	}, { 'Content-Security-Policy': 'CSP' });
}

function toHaveCorrectReportHeaders(res) {
	const reportURL = process.env.NGINX_REPORT_URL;

	return toHaveCorrectHeaders.call(this, res, {
		'Reporting-Endpoints': `endpoint="${reportURL}", default="${reportURL}"`,
		'NEL': '{ "report_to": "endpoint", "include_subdomains": true, "max_age": 2592000 }',
		'Report-To': `{ "group": "endpoint", "include_subdomains": true, "max_age": 2592000, "endpoints": [ { "url": "${reportURL}" } ] }`
	});
}

function toHaveCorrectSecurityHeaders(res) {
	return toHaveCorrectHeaders.call(this, res, {
		'X-Content-Type-Options': 'nosniff',
		'X-Permitted-Cross-Domain-Policies': 'none',

		'Referrer-Policy': 'same-origin',
		'Cross-Origin-Embedder-Policy': 'require-corp',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Resource-Policy': 'same-origin',

		'X-Frame-Options': 'deny',
		'X-XSS-Protection': '0'
	});
}

function toBeCompressedWith(res, compression, force = false) {
	// TODO: We should interfere with how superagent decompresses response to support brotli (TEST)
	if (compression === '') compression = undefined;
	const type = dropCharset(res.headers['content-type']);
	const shouldNotBeCompressed = type.startsWith('font/') || type.startsWith('video/') || (type.startsWith('image/') && type !== 'image/svg+xml' && type !== 'image/x-icon');
	return toHaveCorrectHeader.call(this, res, 'Content-Encoding', shouldNotBeCompressed && !force ? undefined : compression, undefined, true);
}

function toHaveNoOtherHeaders(res) {
	const headers = [];
	for (const header of res._uncheckedHeaders) {
		if (header !== 'date' && header !== 'vary' && header !== 'connection' && header !== 'content-length' && header !== 'retry-after' && header !== 'accept-ranges' && header !== ':status' && header !== 'transfer-encoding') headers.push(header);
		// TODO: Test these headers (TEST)
	}

	const pass = headers.length === 0;
	const message = () => `expected response to ${pass ? '' : 'not '}have any non-handled headers, found ${this.utils.printReceived(headers.map(h => h + ': "' + res.headers[h] + '"').join(', '))}`;
	return { message, pass };
}

// matcher for HTTP 1/2/3

expect.extend({ toHaveStatus, toBeFound, toBeNotFound, toHaveBody, toHaveFileBody, toHaveHeader, toHaveCorrectHeader, toHaveCorrectHeaders, toRedirectTo, toHaveMimeType, toHaveCorrectHSTSHeader, toHaveCorrectServerHeader, toBeUncacheable, toRequireRevalidation, toBeImmutable, toHaveDefaultPolicyHeaders, toHaveCorrectReportHeaders, toHaveCorrectSecurityHeaders, toBeCompressedWith, toHaveNoOtherHeaders });