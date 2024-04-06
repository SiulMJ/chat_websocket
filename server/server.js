
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
      console.log(messageData);
      if (action === "join") {
        joinChannel(socket, channelName);
      } else if (action === "create") {
        createChannel(socket, channelName, userId);
      } else if (action === "message" && channelName) {
        sendMessageToChannel(socket, channelName, username, message);
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
  const userId = socket.userId;

  // Verificar si el usuario es el creador del grupo al que intenta unirse
  const sqlCheckCreator = `SELECT id_usuario FROM grupos WHERE groupname = ? AND id_usuario = ?`;
  con.query(sqlCheckCreator, [channelName, userId], (err, creatorResult) => {
    if (err) {
      console.error("Error al verificar el creador del grupo:", err);
      socket.send(`alert:Error al unirse al canal`);
      return;
    }

    if (creatorResult.length > 0) {
      // Usuario es el creador del grupo
      const sqlUpdateRole = `UPDATE usuarios SET rol = 1 WHERE id_usuario = ?`;
      con.query(sqlUpdateRole, [userId], (err, updateResult) => {
        if (err) {
          console.error("Error al actualizar el rol del usuario al unirse al nuevo grupo:", err);
          socket.send(`alert:Error al actualizar el rol del usuario`);
          return;
        }
        console.log(`Rol actualizado a administrador para el usuario ID: ${userId}`);
      });
    } else {
      // Usuario no es el creador del grupo
      const sqlUpdateRole = `UPDATE usuarios SET rol = 0 WHERE id_usuario = ?`;
      con.query(sqlUpdateRole, [userId], (err, updateResult) => {
        if (err) {
          console.error("Error al actualizar el rol del usuario al unirse al nuevo grupo:", err);
          socket.send(`alert:Error al actualizar el rol del usuario`);
          return;
        }
        console.log(`Rol actualizado a usuario normal para el usuario ID: ${userId}`);
      });
    }

    const sql = `SELECT id_grupo FROM grupos WHERE groupname = ?`;
    con.query(sql, [channelName], (err, result) => {
      if (err) {
        console.error("Error al unirse al canal:", err);
        socket.send(`alert:Error al unirse al canal`);
        return;
      }

      if (result.length > 0) {
        const groupId = result[0].id_grupo;
        socket.groupId = groupId;
        console.log(`Cliente unido al canal '${channelName}' con ID de grupo ${groupId}`);
        socket.send(`info:Te has unido al canal '${channelName}'`);
      } else {
        socket.send(`alert:El canal '${channelName}' no existe`);
      }
    });
  });
}

function createChannel(socket, channelName) {
  const userId = socket.userId;

  const sqlCheckExists = `SELECT id_grupo FROM grupos WHERE groupname = ?`;
  con.query(sqlCheckExists, [channelName], (err, result) => {
    if (err) {
      console.error("Error al verificar si el grupo existe:", err);
      socket.send(`alert:Error al verificar si el grupo existe`);
      return;
    }

    if (result.length > 0) {
      // El grupo ya existe, enviar mensaje al cliente
      console.log(`El canal '${channelName}' ya existe`);
      socket.send(`alert:El canal '${channelName}' ya existe`);
    } else {
      // El grupo no existe, proceder con la creación
      const sqlInsert = `INSERT INTO grupos (groupname, id_usuario) VALUES (?, ?)`;
      con.query(sqlInsert, [channelName, userId], (err, insertResult) => {
        if (err) {
          console.error("Error al crear el canal:", err);
          socket.send(`alert:Error al crear el canal`);
          return;
        }

        console.log(`Canal '${channelName}' creado`);
        socket.send(`info:Canal '${channelName}' creado`);

        // Resto del código para actualizar el rol del usuario, etc.
      });
    }
  });
}

function sendMessageToChannel(socket, channelName, username, message) {
  const groupId = socket.groupId;
  const sql = `SELECT * FROM grupos WHERE groupname = ?`;
  con.query(sql, [channelName], (err, result) => {
    if (err) {
      console.error("Error al enviar mensaje al canal:", err);
      return;
    }
    
    if (result.length > 0) {
      const formattedMessage = `Mensaje de ${username}: ${message}`;
      
      // Recorrer todos los clientes conectados al WebSocket y enviar el mensaje
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(formattedMessage);
          console.log(formattedMessage);
        }
      });
    } else {
      console.log(`El canal '${channelName}' no existe`);
    }
  });
  const userId = socket.userId
  const insertu = `INSERT INTO mensajes (id_usuario, id_grupo, mensaje) VALUES (?, ?, ?)`;
  con.query(insertu, [userId, groupId, message], (err, result) => {
    if (err) {
      console.error("Error al insertar mensaje en la base de datos:", err);
      return;
    }
  
    console.log("Mensaje insertado correctamente en la base de datos");
  });
  
}

console.log('WebSocket conectado en el puerto 4000');
