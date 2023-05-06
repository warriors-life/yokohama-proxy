import request, { websocket } from './request.js';
import './matchers.js';

const mime = {
	txt: 'text/plain',
	csv: 'text/csv',

	html: 'text/html',
	css: 'text/css',
	js: 'application/javascript',

	json: 'application/json',
	webmanifest: 'application/manifest+json',

	svg: 'image/svg+xml',
	webp: 'image/webp',

	png: 'image/png',
	ico: 'image/x-icon',

	webm: 'video/webm',

	woff2: 'font/woff2',

	wasm: 'application/wasm'
};

//const cartesian = (...a) => a.reduce((b, c) => b.flatMap(d => c.map(e => [...d, e])), [[]]); // https://stackoverflow.com/a/43053803

function awaitWebSocketResponse(ws) {
	return new Promise((resolve, reject) => {
		ws.on('message', data => resolve(data.toString()));
		ws.on('error', reject);
	});
}

describe('Static pages work', () => {
	test.each(Object.keys(mime))('%s static page with hash', async ext => {
		const name = `test.${ext}`;
		const nameWithHash = `test-${'0'.repeat(64)}.${ext}`;

		const res = await request('/' + nameWithHash);
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/' + name);
		expect(res).toHaveMimeType(mime[ext]);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toBeImmutable();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip');
		expect(res).toHaveNoOtherHeaders();
	});

	test.each(Object.keys(mime))('%s static page without hash', async ext => {
		const name = `test.${ext}`;

		const res = await request('/' + name);
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/' + name);
		expect(res).toHaveMimeType(mime[ext]);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toRequireRevalidation();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip');
		expect(res).toHaveNoOtherHeaders();
	});
});

describe('Dynamic pages work', () => {
	test('Cacheable and compressable', async () => {
		const res = await request('/cache-compress');
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toRequireRevalidation();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip', true);
		expect(res).toHaveNoOtherHeaders();
	});

	test('Uncacheable and compressable', async () => {
		const res = await request('/uncache-compress');
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toBeUncacheable();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip', true);
		expect(res).toHaveNoOtherHeaders();
	});

	test('Cacheable and uncompressable', async () => {
		const res = await request('/cache-uncompress');
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.webp');
		expect(res).toHaveMimeType(mime.webp);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toRequireRevalidation();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('');
		expect(res).toHaveNoOtherHeaders();
	});

	test('Uncacheable and uncompressable', async () => {
		const res = await request('/uncache-uncompress');
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.webp');
		expect(res).toHaveMimeType(mime.webp);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toBeUncacheable();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('');
		expect(res).toHaveNoOtherHeaders();
	});

	test('Policies can be modified', async () => {
		const res = await request('/modify-policy');
		expect(res).toHaveCorrectHeader('Content-Security-Policy', 'dummy policy', 'CSP');
	});
});

describe('HTTP/2 works', () => {
	// TODO: checking HTTP/2 parameters and push preloading

	test('Static', async () => {
		const res = await request(`/test-${'0'.repeat(64)}.html`, { http2: true });
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toBeImmutable();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip');
		expect(res).toHaveNoOtherHeaders();
	});

	test('Dynamic', async () => {
		const res = await request('/cache-compress', { http2: true });
		expect(res).toBeFound();
		await expect(res).toHaveFileBody('server/static/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toRequireRevalidation();
		expect(res).toHaveDefaultPolicyHeaders();
		expect(res).toHaveCorrectReportHeaders();
		expect(res).toHaveCorrectSecurityHeaders();
		expect(res).toBeCompressedWith('gzip', true);
		expect(res).toHaveNoOtherHeaders();
	});
});

describe('IPv6 works', () => {
	test('HTTP', () => expect(request('/', { ipv6: true, secure: false })).resolves.toHaveStatus(308));
	test('HTTPS', () => expect(request('/', { ipv6: true })).resolves.toBeFound());
});

test('WebSockets work', async () => {
	const ws = await websocket(process.env.NGINX_CHAT_WEBSOCKET_URL);
	expect(await awaitWebSocketResponse(ws)).toBe('Hello World!');
	ws.send('test');
	expect(await awaitWebSocketResponse(ws)).toBe('Test!!');
	ws.close();
	// TODO: check Connection header and maybe some advanced WebSocket features
});

describe('Paths', () => {
	test('Static with subfolders', () => expect(request('/test/test2-abc_def/file.txt')).resolves.toBeFound());
	test('Dynamic with subfolders', () => expect(request('/test/test2-abc_def/test')).resolves.toBeFound());
	test('Static-like without extension', () => expect(request('/test/test2-abc_def/file')).resolves.toBeNotFound());
	test('Dynamic-like with extension', () => expect(request('/test/test2-abc_def/test.txt')).resolves.toBeNotFound());
	test('Long static', () => expect(request('/test/test2-abc_def/1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111.txt')).resolves.toBeFound());
	test('Long dynamic', () => expect(request('/test/test2-abc_def/1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000')).resolves.toBeFound());
	test('Static uppercase 1', () => expect(request('/TEST.html')).resolves.toBeFound()); // ^
	test('Static uppercase 2', () => expect(request('/TEST.HTML')).resolves.toBeFound()); // ^
	test('Dynamic uppercase', () => expect(request('/CACHE-COMPRESS')).resolves.toBeFound()); // _
	test('Invalid characters (static)', async () => {
		// TODO: would be great to have a test for e.g.  (\x01) character, but I have *no* idea how to create a file with such name
		// also, \.txt?

		expect(await request('/invalid/ .txt')).toBeNotFound();
		expect(await request('/invalid/".txt')).toBeNotFound();
		expect(await request('/invalid/@.txt')).toBeNotFound();
		expect(await request('/invalid/$.txt')).toBeNotFound();
		expect(await request('/invalid/&.txt')).toBeNotFound();
		expect(await request('/invalid/*.txt')).toBeNotFound();
		expect(await request('/invalid/.abc.txt')).toBeNotFound();
		expect(await request('/invalid/:.txt')).toBeNotFound();
		expect(await request('/invalid/?.txt')).toBeNotFound();
		expect(await request('/invalid/=.txt')).toBeNotFound();
		expect(await request('/invalid/|.txt')).toBeNotFound();
		expect(await request('/invalid/я.txt')).toBeNotFound();
		expect(await request('/invalid/🀜.txt')).toBeNotFound();
	});
	test('Invalid characters (dynamic)', async () => {
		expect(await request('/invalid/ ')).toBeNotFound();
		expect(await request('/invalid/"')).toBeNotFound();
		expect(await request('/invalid/@')).toBeNotFound();
		expect(await request('/invalid/$')).toBeNotFound();
		expect(await request('/invalid/&')).toBeNotFound();
		expect(await request('/invalid/*')).toBeNotFound();
		expect(await request('/invalid/.')).toBeNotFound();
		expect(await request('/invalid/:')).toBeNotFound();
		expect(await request('/invalid/?')).toBeNotFound();
		expect(await request('/invalid/=')).toBeNotFound();
		expect(await request('/invalid/|')).toBeNotFound();
		expect(await request('/invalid/я')).toBeNotFound();
		expect(await request('/invalid/🀜')).toBeNotFound();
		expect(await request('/invalid/\\')).toBeNotFound();
	});
	test('Strange paths', async () => {
		expect(await request('//test.txt')).toBeFound();
		expect(await request('/./test.txt')).toBeFound();
		expect(await request('/../test.txt')).toBeNotFound(); // ^
		expect(await request('/test//test2-abc_def')).toBeFound();
		expect(await request('/test/./test2-abc_def')).toBeFound();
		expect(await request('/test/../test2-abc_def')).toBeNotFound(); // _
		expect(await request('/cache-compress/')).toBeNotFound();
	});
	test('Potentially sensitive files', () => expect(request('/test.sh')).resolves.toBeNotFound());
	test('GET with query', async () => {
		const res = await request('/add?a=3&b=2');
		expect(res).toBeFound();
		expect(res).toHaveBody('5');
	});
});

describe('Redirects work', () => {
	test('HTTP->HTTPS redirect', async () => {
		const res = await request('/test.html', { secure: false });
		expect(res).toRedirectTo('/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectServerHeader();
		expect(res).toHaveNoOtherHeaders();
	});

	test('WWW->nothing redirect', async () => {
		const res = await request('/test.html', { www: true });
		expect(res).toRedirectTo('/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectHSTSHeader();
		expect(res).toHaveCorrectServerHeader();
		expect(res).toHaveNoOtherHeaders();
	});

	test('Both redirects', async () => {
		const res = await request('/test.html', { secure: false, www: true });
		expect(res).toRedirectTo('/test.html');
		expect(res).toHaveMimeType(mime.html);
		expect(res).toHaveCorrectServerHeader();
		expect(res).toHaveNoOtherHeaders();
	});
});

describe('Invalid hostname is blocked', () => {
	test('HTTP', () => {
		const req = request('/test.html', { domain: 'no-such.domain', secure: false });
		return expect(req).rejects.toThrow('socket hang up');
	});

	test('HTTPS', () => {
		const req = request('/test.html', { domain: 'no-such.domain' });
		return expect(req).rejects.toThrow('write EPROTO');
	});
});

// TODO: should body be checked on 3xx responses?

// checking IPv4 and IPv6

// checking methods (HEAD, GET, POST, also checking no others are allowed and no POST for static or dynamic with invalid referrer)

// checking errors are thrown correctly and correctly handled (incl. Retry-After header)

// checking "cache-control: no-cache", etag, and if-none-match

// checking ranges

// checking rate limiting (incl. all of rate_limiting.conf)

// checking all of ssl.conf
// checking all of compression.conf

// checking performance.conf
// checking proxy.conf (incl. x-forwarded headers)
// checking proxy things in dynamic.conf
// checking nginx.conf

// checking lingering close
// checking msie_padding

// checking how resolve works
// checking proxy_cache_path
// checking caching proxy on nginx
// checking deferred & reuseport
// checking auth_delay
// checking upstreams' parameters