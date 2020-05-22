#!/usr/bin/env node

require('make-promises-safe');

const Server = require('./lib/server');

const server = new Server({
  address: process.env.FACET_MUD_ADDRESS || '::',
  port: process.env.FACET_MUD_PORT || 8000
});
server.startServer();

process.on('SIGINT', () => {
  server.shutdown();
  process.exit();  // eslint-disable-line no-process-exit
});
