const log = require('../log');
const logPrefix = 'WS';
const WebSocket = require('ws');

const wsResponse = (webSocketConnection, connectionRequest, connectedResponse) => {

  // @TODO AO - use the connectionRequest for chat debugging/interception

  webSocketConnection.send(JSON.stringify(connectedResponse));
};

const onServerConnection = (webSocketConnection, connectionRequest) => {
  const [path, params] = connectionRequest?.url?.split('?') || [null, null];

  webSocketConnection.on('message', (message) => {
    // @TODO handle requests from the browser source

    // @TODO handle requests from the streamdeck
  });

  webSocketConnection.on('close', () => {
    // @TODO 
  });

  const connectedResponse = {};
  switch (params?.view) {
    default:
      connectedResponse.requestType = 'browser-source';
  }

  // @TODO do stuff to the connection response lol

  return wsResponse(webSocketConnection, connectionRequest, connectedResponse);
};

exports.createWebSocketServer = (expressServer) => {
  const webSocketServer = new WebSocket.WebSocketServer({
    noServer: true,
    path: '/websockets'
  });

  expressServer.on('upgrade', (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit('connection', ws, request);
    });
  });

  webSocketServer.on('connection', onServerConnection);

  log.debug('WebSocket Created', {
    url: '/websockets',
  }, logPrefix);
  return webSocketServer;
};
