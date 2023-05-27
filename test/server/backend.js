import express from 'express';
import { WebSocketServer } from 'ws';

const backendPort = process.env.BACKEND_PORT;
const websocketPort = process.env.WEBSOCKET_PORT;

const app = express();

// required minimal configuration for working with the proxy
app.disable('x-powered-by');
app.disable('etag');
app.disable('case sensitive routing');
app.enable('strict routing');
app.enable('trust proxy');
const oldSendFile = express.response.sendFile;
express.response.sendFile = function sendFile(path, options = {}, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	options = Object.assign({
		root: '.',
		index: [],
		lastModified: false,
		etag: false,
		cacheControl: false,
		acceptRanges: true,
		headers: {}
	}, options);
	options.headers = Object.assign(this.getHeaders(), options.headers);
	return oldSendFile.call(this, path, options, callback);
};
app.use((req, res, next) => {
	['Content-Security-Policy', 'Permissions-Policy', 'Document-Policy', 'Feature-Policy', 'Cache-Control'].forEach(header => res.set(header, req.get(header)));
	next();
});

app.get('/cache-compress', (req, res) => {
	res.set('Cache-Control', 'no-cache').set('ETag', 'W/"123"').type('html').sendFile('server/static/test.html');
});
app.get('/uncache-compress', (req, res) => {
	res.type('html').sendFile('server/static/test.html');
});
app.get('/cache-uncompress', (req, res) => {
	res.set('Cache-Control', 'no-cache').set('ETag', '"123"').type('webp').sendFile('server/static/test.webp');
});
app.get('/uncache-uncompress', (req, res) => {
	res.type('webp').sendFile('server/static/test.webp');
});

app.get('/modify-policy', (req, res) => {
	res.set('Content-Security-Policy', 'dummy policy').type('html').sendFile('server/static/test.html');
});

app.get('/test/test2-abc_def/test', (req, res) => res.type('txt').send(''));
app.get('/test/test2-abc_def/1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000', (req, res) => res.type('txt').send(''));

app.get('/add', (req, res) => res.type('txt').send(Number(req.query.a) + Number(req.query.b) + ''));

app.get('/invalid/ ', (req, res) => res.type('txt').send(''));
app.get('/invalid/"', (req, res) => res.type('txt').send(''));
app.get('/invalid/@', (req, res) => res.type('txt').send(''));
app.get('/invalid/$', (req, res) => res.type('txt').send(''));
app.get('/invalid/&', (req, res) => res.type('txt').send(''));
app.get('/invalid/*', (req, res) => res.type('txt').send(''));
app.get('/invalid/.', (req, res) => res.type('txt').send(''));
app.get('/invalid/:', (req, res) => res.type('txt').send(''));
app.get('/invalid/?', (req, res) => res.type('txt').send(''));
app.get('/invalid/=', (req, res) => res.type('txt').send(''));
app.get('/invalid/|', (req, res) => res.type('txt').send(''));
app.get('/invalid/я', (req, res) => res.type('txt').send(''));
app.get('/invalid/🀜', (req, res) => res.type('txt').send(''));
app.get('/invalid/\\', (req, res) => res.type('txt').send(''));

app.listen(backendPort);

const wss = new WebSocketServer({ port: websocketPort });

wss.on('connection', ws => {
	ws.on('error', console.error);

	ws.on('message', data => {
		if (data.toString() === 'test') ws.send('Test!!');
	});

	ws.send('Hello World!');
});