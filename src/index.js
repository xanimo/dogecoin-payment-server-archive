/* eslint-disable no-console */
const http = require('http');
const app = require('./app');
const { checkConfig, checkDogecoinNode } = require('./util');

require('dotenv').config();

async function main() {
  // verify envrionment is correct, rpc user pw url port
  checkConfig();

  // Ping node to verify if it is accessible
  checkDogecoinNode();

  // Start server
  const port = process.env.PORT || 5000;
  const server = http.createServer(app);
  server.listen(port);

  /*
   * Some functions to help with errors
  */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      case 'EBADCSRFTOKEN':
        console.error(`${bind} for has been tampered with`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `${addr.port}`;

    console.log(`Listening: http://localhost:${bind}`);
  }

  server.on('error', onError);
  server.on('listening', onListening);
}

main()
  .catch(
    (e) => {
      console.log(e);
      process.exit(0);
    }
  );
