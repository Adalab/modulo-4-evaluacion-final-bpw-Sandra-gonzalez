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
const PORT = 4000;
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
        port: process.env.PORT
    });
    return connection;
};


// Endpoint para obtener todas las tareas. CRUD

// GET /frases - Listar todas las frases (con información del personaje y el título del capítulo)


server.get("/frases", async (req, res) => {
    // recojo los datos que me envía el frontend y los guardo en una constante
    const nombre_personaje = req.query.nombre_personaje;
    console.log('nombre_personaje:', nombre_personaje);

    // Conecto con la base de datos

    const connection = await getConnection();

    // Realizo la query a la base de datos
    const QuerySQL = await connection.execute("SELECT * FROM frases WHERE nombre_personaje = ?", [nombre_personaje]);
    const [result] = await connection.query(QuerySQL, [nombre_personaje]);
    console.log("result es:", result);

    res.json(result);

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

//delete: eliminar datos


