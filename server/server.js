const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 4000 });
const channels = new Map(); // Almacenar clientes conectados por canal
console.log(channels);
server.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("message", (data) => {
    console.log(`Mensaje recibido del cliente: ${data}`);

    try {
      const messageData = JSON.parse(data);
      const { action, channelName, message } = messageData;

      if (action === "join") {
        if (channels.has(channelName)) {
          joinChannel(socket, channelName);
        } else {
          socket.send(`alert:El canal '${channelName}' no existe`);
        }
      } else if (action === "create") {
        createChannel(socket, channelName);
      } else if (action === "message" && channelName) {
        sendMessageToChannel(channelName, message);
      }
    } catch (error) {
      console.error("Error al parsear el mensaje JSON:", error);
    }
  });

  socket.on("close", () => {
    console.log("Cliente desconectado");
    removeClientFromChannels(socket);
  });
});

function joinChannel(socket, channelName) {
  channels.get(channelName).add(socket);
  console.log(`Cliente unido al canal '${channelName}'`);
  socket.send(`info:Te has unido al canal '${channelName}'`);
}

function createChannel(socket, channelName) {
  if (channels.has(channelName)) {
    socket.send(`alert:El canal '${channelName}' ya existe`);
    return;
  }

  channels.set(channelName, new Set());
  channels.get(channelName).add(socket);
  console.log(`Canal '${channelName}' creado`);
  socket.send(`info:Canal '${channelName}' creado`);
}

function sendMessageToChannel(channelName, message) {
  if (!channels.has(channelName)) {
    console.log(`El canal '${channelName}' no existe`);
    return;
  }

  channels.get(channelName).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`Cliente: ${message}`);
    }
  });
}

function removeClientFromChannels(socket) {
  channels.forEach((channelClients) => {
    if (channelClients.has(socket)) {
      channelClients.delete(socket);
    }
  });
}

console.log('WebSocket conectado en el puerto 4000');
