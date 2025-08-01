Este proyecto forma parte del desarrollo de backend del módulo 4.

API Los Simpson

Una API desarrollada en Node.js y MySQL que gestiona información sobre personajes, frases y capítulos de la serie Los Simpson.

Tecnologías utilizadas

. Node.js
. Express
. MySQL
. cors
. dotenv
. nodemon
. Postman (para pruebas)

Estructura de ficheros
/los-simpson-api
├── index.js  
├── .env  
├── .gitignore  
├── README.md
└── package.json

Estructura base de datos api_los_simpson

. personajes

. frases

. capitulos

. capitulos_personajes : tabla intermedia para la relación muchos a muchos

Relaciones

. Un personaje tiene muchas frases (1:N)

. Un personaje puede estar en varios capítulos (N:M)

Endpoints

. GET/frases
. GET/frases/:id
. POST/api/frases
. PUT/frases/:id
. DELETE/frases/:id
. POST/register

Sistema de autenticación con JSON Web Token
Registro de una nueva usuaria. Se envia un JSON con los siguientes campos:

{
"email": "xxxx@email.com",
"password": "contraseña1234",
"nombre": "xxxxx"
}
El token tiene una duración de 1 hora.

La contraseña se almacena en formato hasheado con bcrypt.
