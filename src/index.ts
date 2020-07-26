#!/usr/bin/env node

import 'make-promises-safe';
import { config as configEnv } from 'dotenv';
import { resolve } from 'path';

import Server from './lib/server';
import Config from './config';

// First, load a top-level .env file into the environment
configEnv({ path: resolve(__dirname, '../.env') });
// Then, run our config loader
const config = Config.getInstance();
const server = new Server({
  address: config.serverAddress,
  port: config.serverPort
});
server.startServer();

process.on('SIGINT', () => {
  server.shutdown();
  process.exit();  // eslint-disable-line no-process-exit
});
