const log = require('../log')
const logPrefix = 'WS'
const queryString = require('query-string')
const WebSocket = require('ws')
const { fireActions } = require('./actions')
const { objectHasProp, isArray, isString, isObject } = require('../support')
const { fireEventListeners } = require('./events')

let webSocketServer

const wsResponse = async (ws, request, response) => {
  const hasMessage = objectHasProp(response, 'message')
  let { message, user, action, actions, ...deltaResponse } = response

  if (isArray(actions)) await fireActions(actions)
  if (isString(action)) action = { id: action, args: [] }
  if (isObject(action)) action = [action]
  if (isArray(action)) await fireActions(action)

  ws.send(JSON.stringify(response))
}

const wsEventResponse = async (ws, { event, payload, ...data }) => {
  await fireEventListeners(ws, event, payload, data)
}

const onServerConnection = (webSocketConnection, connectionRequest) => {
  const [path, params] = connectionRequest?.url?.split('?') || [null, null]
  const connectionParams = queryString.parse(params)

  webSocketConnection.on('message', (message) => {
    const data = JSON.parse(message)

    if (data.event) {
      return wsEventResponse(webSocketConnection, data)
    }

    // @TODO handle requests from the browser source

    // @TODO handle requests from the streamdeck

    if (data.event) {
      wsResponse(webSocketConnection, {}, data)
    }
  })

  webSocketConnection.on('close', () => {
    // @TODO
  })

  const connectedResponse = {}
  switch (connectionParams?.view) {
    case 'debug':
      connectedResponse.requestType = 'debug'
      break
    default:
      connectedResponse.requestType = 'browser-source'
  }

  return wsResponse(webSocketConnection, connectionRequest, connectedResponse)
}

exports.getWebSocketServer = () => webSocketServer

exports.broadcastToClients = (data) => {
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

exports.createWebSocketServer = (expressServer) => {
  const { registerActions } = require('./actions')
  const { registerEventListeners } = require('./events')

  webSocketServer = new WebSocket.WebSocketServer({
    noServer: true,
    path: '/websockets'
  })

  expressServer.on('upgrade', (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit('connection', ws, request)
    })
  })

  webSocketServer.on('connection', onServerConnection)

  registerActions()
  registerEventListeners()

  log.debug(
    'WebSocket Created',
    {
      url: '/websockets'
    },
    logPrefix
  )
  return webSocketServer
}
