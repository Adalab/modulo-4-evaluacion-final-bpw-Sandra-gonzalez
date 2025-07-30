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


// Endpoint para obtener todas las tareas
