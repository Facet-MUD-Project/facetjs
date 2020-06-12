#!/usr/bin/env node

import Server from "./lib/server";
import Config from "./config";

import('make-promises-safe');

const config = Config.getInstance();
const server = new Server({
  address: config.server_address,
  port: config.server_port
});
server.startServer();

process.on('SIGINT', () => {
  server.shutdown();
  process.exit();  // eslint-disable-line no-process-exit
});
