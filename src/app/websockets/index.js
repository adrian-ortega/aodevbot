const log = require('../log');
const logPrefix = 'WS';
const WebSocket = require('ws');
const { fireActions } = require('./actions');
const { objectHasProp, isArray, isString, isObject } = require('../support');

let webSocketServer

const wsResponse = async (webSocketConnection, connectionRequest, connectedResponse) => {
  const hasMessage = objectHasProp(connectedResponse, 'message');
  let { message, user, action, actions, ...deltaResponse } = connectedResponse;

  if (isArray(actions)) await fireActions(actions);
  if (isString(action)) action = { id: action, args: [] };
  if (isObject(action)) action = [action];
  if (isArray(action)) await fireActions(action);

  webSocketConnection.send(JSON.stringify(connectedResponse));
};

const onServerConnection = (webSocketConnection, connectionRequest) => {
  const [path, params] = connectionRequest?.url?.split('?') || [null, null];

  webSocketConnection.on('message', (message) => {
    const data = JSON.parse(message);

    // @TODO handle requests from the browser source

    // @TODO handle requests from the streamdeck

    if (data.fromLocal) {
      wsResponse(webSocketConnection, {}, data);
    }
  });

  webSocketConnection.on('close', () => {
    // @TODO 
  });

  const connectedResponse = {};
  switch (params?.view) {
    default:
      connectedResponse.requestType = 'browser-source';
  }

  return wsResponse(webSocketConnection, connectionRequest, connectedResponse);
};

exports.getWebSocketServer = () => webSocketServer;

exports.broadcastToClients = (data) => {
  webSocketServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

exports.createWebSocketServer = (expressServer) => {
  const { registerActions } = require('./actions');

  webSocketServer = new WebSocket.WebSocketServer({
    noServer: true,
    path: '/websockets'
  });

  expressServer.on('upgrade', (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit('connection', ws, request);
    });
  });

  webSocketServer.on('connection', onServerConnection);

  registerActions(webSocketServer);

  log.debug('WebSocket Created', {
    url: '/websockets',
  }, logPrefix);
  return webSocketServer;
};
