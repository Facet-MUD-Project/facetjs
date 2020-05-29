#!/usr/bin/env node

import Server from "./lib/server";

import('make-promises-safe');

const server = new Server({
  address: process.env.FACET_MUD_ADDRESS || '::',
  port: parseInt(process.env.FACET_MUD_PORT) || 8000
});
server.startServer();

process.on('SIGINT', () => {
  server.shutdown();
  process.exit();  // eslint-disable-line no-process-exit
});
