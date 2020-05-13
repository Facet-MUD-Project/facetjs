const Server = require('./lib/server');

const server = new Server();
server.startServer();

process.on('SIGINT', () => {
  server.shutdown();
  process.exit();  // eslint-disable-line no-process-exit
});
