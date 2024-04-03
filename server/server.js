const WebSocket = require("ws");
const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat",
});

const server = new WebSocket.Server({ port: 4000 });

con.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err);
    return;
  }
  console.log("Conexión a MySQL establecida correctamente");
});

server.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("message", (data) => {
    console.log(`Mensaje recibido del cliente: ${data}`);

    try {
      const messageData = JSON.parse(data);
      const { action, channelName, message, username, password, userId } = messageData;

      if (action === "join") {
        joinChannel(socket, channelName);
      } else if (action === "create") {
        createChannel(socket, channelName, userId);
      } else if (action === "message" && channelName) {
        sendMessageToChannel(channelName, username, message);
      } else if (action === "login") {
        validarlogin(socket, username, password);
      }
    } catch (error) {
      console.error("Error al parsear el mensaje JSON:", error);
    }
  });

  socket.on("close", () => {
    console.log("Cliente desconectado");
  });
});

function validarlogin(socket, username, password) {
  const sql = `SELECT id_usuario FROM usuarios WHERE username = ? AND password = ?`;
  con.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Error al validar el inicio de sesión:", err);
      socket.send(`alert:Error al validar el inicio de sesión`);
      return;
    }

    if (result.length > 0) {
      const userId = result[0].id_usuario;
      socket.userId = userId;
      socket.send(`info:Inicio de sesión exitoso, ID: ${userId}`);

      // Realizar la consulta para obtener los grupos a los que pertenece el usuario
      const sql2 = `SELECT * FROM grupos WHERE id_usuario = ?`;

      con.query(sql2, [userId], (err, groupsResult) => {
        if (err) {
          console.error("Error al obtener los grupos del usuario:", err);
          return;
        }
        if (groupsResult.length > 0) {
          const groupsData = JSON.stringify(groupsResult);
          socket.send(`groups:${groupsData}`);
        } else {
          socket.send(`alert:El usuario no pertenece a ningún grupo`);
        }
      });
    } else {
      // Nombre de usuario o contraseña incorrectos
      socket.send(`alert:Nombre de usuario o contraseña incorrectos`);
    }
  });
}

function joinChannel(socket, channelName) {
  const sql3 = ` `
  const sql = `SELECT * FROM grupos WHERE groupname = ?`;
  con.query(sql, [channelName], (err, result) => {
    if (err) {
      console.error("Error al unirse al canal:", err);
      socket.send(`alert:Error al unirse al canal`);
      return;
    }

    if (result.length > 0) {
      // Aquí puedes realizar acciones adicionales, como agregar el socket al canal, etc.
      console.log(`Cliente unido al canal '${channelName}'`);
      socket.send(`info:Te has unido al canal '${channelName}'`);
    } else {
      socket.send(`alert:El canal '${channelName}' no existe`);
    }
  });
}

function createChannel(socket, channelName) {
  const userId = socket.userId;
  console.log(userId);
  const sql = `INSERT INTO grupos (groupname, id_usuario) VALUES (?, ?)`;
  con.query(sql, [channelName, userId], (err, result) => {
    if (err) {
      console.error("Error al crear el canal:", err);
      socket.send(`alert:Error al crear el canal`);
      return;
    }

    console.log(`Canal '${channelName}' creado`);
    socket.send(`info:Canal '${channelName}' creado`);
  });
}


function sendMessageToChannel(channelName, message) {
  const sql = `SELECT * FROM grupos WHERE groupname = ?`;
  con.query(sql, [channelName], (err, result) => {
    if (err) {
      console.error("Error al enviar mensaje al canal:", err);
      return;
    }

    if (result.length > 0) {
      // Aquí puedes enviar el mensaje a todos los sockets en el canal, similar a cómo lo hacías antes.
    } else {
      console.log(`El canal '${channelName}' no existe`);
    }
  });
}

console.log('WebSocket conectado en el puerto 4000');