//import express from 'express'; 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();


// Crear el servidor
const server = express();

// Permitir que el servidor escuche peticiones
server.use(cors());


// Configurar el puerto
const PORT = process.env.SERVER_PORT || 4000;
server.listen(PORT, () => {
    console.log(`Servidor inicializado, en http://localhost:${PORT}`);
})


// Configurar los datos con los que voy a trabajar (le digo que van a ser en formato json)
server.use(express.json());


//Función para conectarme con mysql --> asíncrona
const getConnection = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT

    });


};


// Endpoint para obtener todas las tareas. CRUD

// GET /frases/:id - Obtener una frase específica
server.get("/frases/:id", async (req, res) => {
  try {
  // 1. Recojo el dato que me envía frontend

  const fraseId = req.params.id;
  console.log("fraseId es:", fraseId);
  
// 2. Conecto con la base de datos
  const connection = await getConnection();

// 3. Realizo la query a la base de datos
  const [result] = await connection.query
  ("SELECT * FROM frases WHERE id = ?", [fraseId]);

  console.log("result es:", result);


  // 4. Cierro la conexión
  await connection.end();

  // 5.Envío la respuesta al frontend
  if (result.length === 0) {
    res.status(404).json({
      status: "error",
      message: "No se encuentra frase con ese ID",
    });

  } else {
    res.status(201).json({
      status: "success",
      data: result[0],

    });
  }
   } catch (error) {
    console.error("Error al obtener la frase:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});

// GET /frases - Listar todas las frases (con información del personaje y el título del capítulo)


server.get("/frases", async (req, res) => {
    // recojo los datos que me envía el frontend y los guardo en una constante
    const nombre_personaje = req.query.nombre_personaje;
    console.log('nombre_personaje:', nombre_personaje);

    // Conecto con la base de datos

    const connection = await getConnection();

    // Realizo la query a la base de datos"
    const QuerySQL = await connection.execute("SELECT * FROM frases WHERE id_personaje = ?", [nombre_personaje]);
    const [result] = QuerySQL;

    // Cierro la conexión
    await connection.end();

    // Envío la respuesta al frontend
     if (result.length === 0) {
    res.status(404).json({
      status: "error",
      message: "No se encuentra tu solicitud",
    });
  } else {
    res.status(201).json({
      status: "succes",
      message: result,
    });
  }
});

//post: enviar datos al servidor, insertar una frase nueva

server.post("/api/frases", async (req, res) => {
  console.log(req.body);

  // 1. Recojo los datos que me envía el frontend
  const { texto, personaje } = req.body;

  // 2. Conecto con la base de datos
  const connection = await getConnection();

  // 3. Buscamos el ID del personaje por su nombre

  try {
    
    const [personajeResult] = await connection.query(
      "SELECT id FROM personajes WHERE nombre = ?",
      [personaje]
    );

    if (personajeResult.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Personaje no existe en la base de datos",
      });
    }
    //4.Obtenemos el ID del personaje
    const id_personaje = personajeResult[0].id;

    // 5. Realizo la query a la base de datos para insertar la nueva frase
    const queryInsert = "INSERT INTO frases (texto, id_personaje) VALUES (?, ?)";
    const [result] = await connection.query(queryInsert, [texto, id_personaje]);

  // 6. Envío la respuesta al frontend
  res.status(201).json({
      success: true,
      message: "Frase insertada correctamente",
      idInsertada: result.insertId,
    });

   } catch (error) {
    console.error("Error al insertar la frase:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al insertar la frase",
    });
  } finally {
    // 7. Cierro la conexión
    await connection.end();
  }
});

//PUT /frases/:id - Actualizar una frase existente
server.put("/frases/:id", async (req, res) => {
  // 1. Recojo el dato que me envía el frontend desde el body
  const fraseId = req.params.id;
  const { texto, personaje } = req.body;
  console.log("fraseId es:", fraseId);
  console.log("texto es:", texto);
  console.log("personaje es:", personaje);

  // 2. Conecto con la base de datos
  const connection = await getConnection();

  try {
    // 3. Busco la frase por su ID
    const [fraseResult] = await connection.query(
      "SELECT * FROM frases WHERE id = ?",
      [fraseId]
    );

    if (fraseResult.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Frase no encontrada",
      });
    }
    //obtengo el ID del personaje a partir del nombre
    const [personajeResult] = await connection.query(
      "SELECT id FROM personajes WHERE nombre = ?",
      [personaje]
    );

    if (personajeResult.length === 0) {
      return res.status(400).json({
        status: "error",
        message: `El personaje "${personaje}" no existe.`,
      });
    }

    const id_personaje = personajeResult[0].id;

    // 4. Actualizo la frase en la base de datos
    const queryUpdate = "UPDATE frases SET texto = ?, id_personaje = ? WHERE id = ?";
    await connection.query(queryUpdate, [texto, id_personaje, fraseId]);

    // 5. Envío la respuesta al frontend
    res.status(200).json({
      status: "success",
      message: "Frase actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar la frase:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  } finally {
    // 6. Cierro la conexión
    await connection.end();
  }
});

//DELETE /frases/:id - Eliminar una frase
server.delete("/frases/:id", async (req, res) => {
  // 1. Recojo el id de la frase que me envía el frontend por params
  const fraseId = req.params.id;
  console.log("fraseId a eliminar:", fraseId);

  // 2. Conecto con la base de datos
  const connection = await getConnection();

  try {
    // 3. Compruebo que la frase existe
    const [fraseResult] = await connection.query(
      "SELECT * FROM frases WHERE id = ?",
      [fraseId]
    );

    if (fraseResult.length === 0) {
      // 4. Si no existe, devuelvo error 404
      return res.status(404).json({
        status: "error",
        message: "Frase no encontrada",
      });
    }

    // 5. Si existe, elimino la frase
    await connection.query("DELETE FROM frases WHERE id = ?", [fraseId]);

    // 6. Devuelvo respuesta de éxito
    res.status(200).json({
      status: "success",
      message: "Frase eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar la frase:", error);
    // 7. En caso de error devuelvo 500
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  } finally {
    // 8. Cierro la conexión
    await connection.end();
  }
});

//endpoints de autenticación
//1. generar token JWT

const generateToken = (payload) => {
  const token = jwt.sign(payload, "secret_key", { expiresIn: "1h" });
  return token;
};

//2. Verificar token JWT
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, "secret_key");
    return decoded;
  } catch (err) {
    return null;
  }
};

//3. Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Token inválido" });
  }

  req.user = decoded;
  next();
};

//Endpoint Register

server.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  console.log(password);

  const passwordHash = await bcrypt.hash(password, 10);
  console.log(passwordHash);
  let sql = "INSERT INTO user (email,password,name) VALUES (?,?,?)";
  let user = {
    email: email,
    passwordHash: passwordHash,
    name: name,
  };
  jwt.sign(user, "secret_key", async (err, token) => {
    if (err) {
      res.status(400).send({ msg: "Error" });
    } else {
      const connection = await getConnection();
      const [results, fields] = await connection.query(sql, [email, passwordHash, name]);
      connection.end();
      res.json({ msg: "success", token: token, id: results.insertId });
    }
  });
});
