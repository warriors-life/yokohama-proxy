import superagent from 'superagent';
import WebSocket from 'ws';
import * as fs from 'fs/promises'; // TODO: why "node:fs/promises" doesn't work? (TEST)

function sleep() {
	return new Promise(resolve => setTimeout(resolve, 300));
}

const caCertificate = await fs.readFile('server' + process.env.NGINX_TRUSTED_CERTS);

export default async function request(path, {
	method = 'GET',
	domain = process.env.NGINX_DOMAIN_NAME,
	origin = 'https://' + domain,
	referrer = origin + '/',
	ipv6 = false,
	http2 = false,
	secure = true,
	proxyPort = secure ? 443 : 80,
	www = false,
	brotli = false,
	data = null,
	auth = false
} = {}) {
	await sleep();

	const proto = secure ? 'https' : 'http';
	const host = (www ? 'www.' : '') + domain;
	const urlOrigin = proto + '://' + host;

	const req = superagent[method.toLowerCase()](urlOrigin + encodeURI(path));
	req.connect({ [host]: { host: ipv6 ? '::1' : '127.0.0.1', port: proxyPort } });

	if (http2) req.http2();
	if (secure) req.ca(caCertificate);

	if (data !== null) req[method === 'GET' ? 'query' : 'send'](data);

	if (auth) req.auth(process.env.NGINX_AUTH_USER, process.env.NGINX_AUTH_PASSWORD);

	req.accept('*/*');
	if (brotli) req.set('Accept-Encoding', 'gzip, deflate, br');
	req.set('Accept-Language', 'en');

	req.set('User-Agent', 'Dummy User Agent');

	if (method !== 'GET') req.set('Origin', origin);
	req.set('Referer', referrer);

	req.redirects(0);

	req.ok(() => true);

	return req;
}

export async function websocket(path, {
	origin = 'https://' + process.env.NGINX_DOMAIN_NAME,
	auth = false
} = {}) {
	await sleep();

	const ws = new WebSocket('wss://127.0.0.1:443' + encodeURI(path), [], {
		auth: auth ? process.env.NGINX_AUTH_USER + process.env.NGINX_AUTH_PASSWORD : undefined,
		headers: {
			'Host': process.env.NGINX_DOMAIN_NAME
			// TODO: other headers
		},
		origin,
		ca: caCertificate
	});
	return new Promise((resolve, reject) => {
		ws.on('open', () => resolve(ws));
		ws.on('error', reject);
	});
}