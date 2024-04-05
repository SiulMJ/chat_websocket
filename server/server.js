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
}


function createChannel(socket, channelName) {
  const userId = socket.userId;

  // Obtener el rol actual del usuario
  const sqlSelect = `SELECT rol FROM usuarios WHERE id_usuario = ?`;
  con.query(sqlSelect, [userId], (err, selectResult) => {
    if (err) {
      console.error("Error al obtener el rol del usuario:", err);
      socket.send(`alert:Error al obtener el rol del usuario`);
      return;
    }

    if (selectResult.length > 0) {
      const userol = selectResult[0].rol;
      console.log(`Rol actual del usuario ID ${userId}: ${userol}`);

      // Verificar si el rol actual es 0 (usuario normal) antes de actualizar a administrador
      if (userol === 0) {
        const sqlInsert = `INSERT INTO grupos (groupname, id_usuario) VALUES (?, ?)`;
        con.query(sqlInsert, [channelName, userId], (err, result) => {
          if (err) {
            console.error("Error al crear el canal:", err);
            socket.send(`alert:Error al crear el canal`);
            return;
          }

          console.log(`Canal '${channelName}' creado`);
          socket.send(`info:Canal '${channelName}' creado`);
        
          const sqlUpdate = `UPDATE usuarios SET rol = 1 WHERE id_usuario = ?`;
          con.query(sqlUpdate, [userId], (err, updateResult) => {
            if (err) {
              console.error("Error al actualizar el rol del usuario:", err);
              return;
            }
            console.log(`Rol actualizado a administrador para el usuario ID: ${userId}`);
          });
        });
      } else {
        console.log(`El usuario ID ${userId} ya es administrador`);
        // Puedes enviar un mensaje al cliente indicando que ya es administrador
        socket.send(`alert:Ya eres administrador`);
      }
    } else {
      console.log(`No se encontró al usuario ID ${userId}`);
      // Puedes enviar un mensaje al cliente indicando que el usuario no existe
      socket.send(`alert:Usuario no encontrado`);
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