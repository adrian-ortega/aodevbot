const WebSocket = require("ws");
module.exports = ({ message, context, type, levels, timestamp, prefix }) => {
  const { getWebSocketServer } = require('../websockets')
  const wss = getWebSocketServer();
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        event: 'log',
        payload: {
          message,
          context,
          type,
          levels,
          timestamp,
          prefix
        }
      }))
    }
  })
}