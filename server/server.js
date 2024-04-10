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
      const {  action, channelName, message, username, password, userId, userList, selectedUsers } = messageData;
      console.log(messageData);
      if (action === "join") {
        joinChannel(socket, channelName);
      } else if (action === "create") {
        createChannel(socket, channelName, userId);
      } else if (action === "message" && channelName) {
        sendMessageToChannel(socket, channelName, username, message);
      } else if (action === "login") {
        validarlogin(socket, username, password);
      } else if (action === "getUsers" && channelName) {
        obtenerUsuarios(socket, channelName);
      } else if (action === "addUsersToDatabase") {
        insertUsersToDatabase(socket, selectedUsers);
      } else if (action === "delete"){
        deletegroup(socket, channelName);
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

  const sql = `SELECT id_usuario, rol FROM usuarios WHERE username = ? AND password = ?`;
  con.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Error al validar el inicio de sesión:", err);
      socket.send(`alert:Error al validar el inicio de sesión`);
      return;
    }

    if (result.length > 0) {
      const userId = result[0].id_usuario;
      socket.userId = userId;
      const userol = result[0].rol;
      socket.userol = userol;
      socket.send(`info:Inicio de sesión exitoso, ID: ${userId}`);


       // Realizar la consulta para obtener el rol al que pertenece el usuario
      // const sql1 = `SELECT  usuarios.rol from usuarios
      // where id_usuario = ?`;
      // con.query(sql1, [userId], (err, Rolresult) => {
      //   if (err) {
      //     console.error("Error al obtener el rol del usuario:", err);
      //     return;
      //   }
      //   if (Rolresult.length > 0) {
      //     const rol = JSON.stringify(Rolresult);
      //     socket.send(`rol:${rol}`);
      //   } else {
      //     socket.send(`alert:El usuario no tiene definido un rol`);
      //   } 
      // });
      

      // Realizar la consulta para obtener los grupos a los que pertenece el usuario
      const sql2 = `SELECT  grupos.groupname from grupos
      where grupos.id_usuario = ? or FIND_IN_SET(?, grupos.id_miembros)`;

      con.query(sql2, [userId, userId], (err, groupsResult) => {
        if (err) {
          console.error("Error al obtener los grupos del usuario:", err);
          return;
        }
        if (groupsResult.length > 0) {
          const groupsData = JSON.stringify(groupsResult);
          socket.send(`groups:${groupsData}`);
          console.log(groupsData);
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
        socket.send(`alert: Te has unido al canal '${channelName}'`);

        const traerms = `SELECT usuarios.username, mensajes.mensaje
        FROM mensajes
        INNER JOIN usuarios ON mensajes.id_usuario = usuarios.id_usuario
        WHERE mensajes.id_grupo = ?`;
        con.query(traerms,[groupId],(err,result) => {
          if(err){
            console.error("Error al trarer los mensajes: ", err);
            socket.send(`alert:Error al unirse al canal`);
            return;
          }else{
            const transferms = JSON.stringify(result);
            console.log(transferms);
            socket.send(transferms);
          } 
        });

      } else {
        socket.send(`alert:El canal '${channelName}' no existe`);
      }
    });
  });
}

function createChannel(socket, channelName) {
  const userId = socket.userId;

  // Verificar si el nombre del canal ya existe en la base de datos
  const checkChannelQuery = `SELECT COUNT(*) as count FROM grupos WHERE groupname = ?`;
  con.query(checkChannelQuery, [channelName], (err, result) => {
    if (err) {
      console.error("Error al verificar el nombre del canal:", err);
      socket.send(`alert:Error al verificar el nombre del canal`);
      return;
    }

    const channelCount = result[0].count;
    if (channelCount > 0) {
      // El nombre del canal ya existe, enviar alerta al cliente
      socket.send(`alert:El nombre '${channelName}' ya está en uso`);
    } else {
      // El nombre del canal no existe, proceder con la creación del canal y la actualización del rol si es necesario
      const sqlSelect = `SELECT rol FROM usuarios WHERE id_usuario = ?`;
      con.query(sqlSelect, [userId], (err, userResult) => {
        if (err) {
          console.error("Error al obtener el rol del usuario:", err);
          socket.send(`alert:Error al obtener el rol del usuario`);
          return;
        }

        if (userResult.length > 0) {
          const userol = socket.userol;
          // Verificar si el rol actual es 0 (usuario normal) antes de actualizar a administrador
          if (userol === 0 || userol === 1) {
            const sqlInsert = `INSERT INTO grupos (groupname, id_usuario) VALUES (?, ?)`;
            con.query(sqlInsert, [channelName, userId], (err, insertResult) => {
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

function obtenerUsuarios(socket, channelName) {
  const userId = socket.userId;
  const sql = `SELECT usuarios.id_usuario, usuarios.username FROM usuarios
  left join chat.grupos on grupos.id_usuario = chat.usuarios.id_usuario
  where usuarios.id_usuario != ?`;
  con.query(sql,[userId], (err, result) => {
    if (err) {
      console.error("Error al obtener los usuarios del grupo:", err);
      socket.send(`alert:Error al obtener los usuarios del grupo`);
      return;
    }

    if (result.length > 0) {
      const userList = result.map(user => ({ id_usuario: user.id_usuario, username: user.username }));
      const userListData = JSON.stringify({ users: userList });
      socket.send(`users:${userListData}`);
    } else {
      socket.send(`alert:No se encontraron usuarios para el grupo '${channelName}'`);
    }
  });
}


function insertUsersToDatabase(socket, selectedUserIds) {
  const groupId = socket.groupId;
  
   // Verificar que selectedUserIds sea una cadena
   if (typeof selectedUserIds !== 'string') {
    console.error('selectedUserIds no es una cadena válida');
    return;
  }

  // Convertir el string de IDs de usuarios en un array
  const userIds = selectedUserIds.split(',').map(userId => parseInt(userId.trim(), 10));

  // Construir la consulta SQL para UD los usuarios en el grupo
  const updateQuery = "UPDATE grupos SET id_miembros = ? WHERE id_grupo = ?";
  const values = [userIds.join(',')];

  con.query(updateQuery, [values,groupId], (err, result) => {
    if (err) {
      console.error("Error al insertar usuarios", err);
      return;
    }
    console.log("Usuarios insertados correctamente");
    socket.send("alert: usuarios ageragados")
  });
}

function deletegroup(socket, channelName) {
  const userId = socket.userId;
  const groupId = socket.groupId;
  const userol = socket.userol;

  const query = `SELECT * FROM grupos LEFT JOIN chat.usuarios ON grupos.id_usuario = usuarios.id_usuario WHERE grupos.id_usuario = ? AND usuarios.rol = ? AND grupos.id_grupo = ?`;
  con.query(query, [userId, userol, groupId], (err, result) => {
    if (err) {
      console.error("Error al validar el inicio de sesión:", err);
      socket.send(`alert:Error al validar el inicio de sesión`);
      return;
    }

    if (result.length > 0) {
      const dele = `DELETE FROM grupos WHERE groupname = ?`;
      con.query(dele, channelName, (err) => {
        if (err) {
          console.error("Error al borrar el grupo", err);
          socket.send(`alert:Error al borrar el grupo`);
          return;
        }

        // Envía un mensaje de confirmación de eliminación a todos los clientes
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`delete:${channelName}`);
          }
        });
      });
    }
  });
}

console.log('WebSocket conectado en el puerto 4000');