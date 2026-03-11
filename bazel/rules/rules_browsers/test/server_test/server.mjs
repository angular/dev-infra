import http from 'http';

if (!process.env['PORT']) {
  throw new Error('No port specified');
}

http
  .createServer(function (_req, res) {
    res.write('Hello World!');
    res.end();
  })
  .listen(Number(process.env.PORT));
