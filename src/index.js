const http = require('http')
const app = require('./app')
const rpc = require('./utils/rpc')
const { checkConfig } = require('./utils/util')

require('dotenv').config()

async function main () {
  // verify envrionment is correct, rpc user pw url port
  checkConfig()

  // Ping node to verify if it is accessible
  rpc.ping()
    .catch(function (res) {
      console.log(res)
      console.log('Dogecoin node not available')
      process.exit(0)
    })

  // Start server
  const port = process.env.PORT || 5000
  const server = http.createServer(app)
  server.listen(port)

  server.on('error', onError)
  server.on('listening', onListening)

  /*
   * Some functions to help with errors
  */

  function onError (error) {
    if (error.syscall !== 'listen') {
      throw error
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

    switch (error.code) {
      case 'EACCES':
        throw new Error(`${bind} requires elevated privileges`)
      case 'EADDRINUSE':
        throw new Error(`${bind} is already in use`)
      case 'EBADCSRFTOKEN':
        throw new Error(`${bind} for has been tampered with`)
      default:
        throw error
    }
  }

  function onListening () {
    const addr = server.address()
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `${addr.port}`

    console.log(`Listening: http://localhost:${bind}`)
  }
}

main()
  .catch(
    function (e) {
      // console.error(e)
      process.exit(0)
    }
  )
