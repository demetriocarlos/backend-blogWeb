
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
require('dotenv').config()


loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body // Extraemos el nombre de usuario y contraseña del cuerpo de la solicitud

     // Buscamos al usuario en la base de datos por su nombre de usuario
    const user = await User.findOne({ username })

    // Comparamos la contraseña proporcionada con la contraseña encriptada almacenada en la base de datos
    const passwordCorrect = user === null
        ? false// Si no se encuentra el usuario, la contraseña es incorrecta
        : await bcrypt.compare(password, user.passwordHash)// Compara las contraseñas


        // Si el usuario no existe o la contraseña es incorrecta, respondemos con un error 401
    if (!(user && passwordCorrect)) {
         
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }
 

    // Si las credenciales son correctas, creamos un objeto que contiene el nombre de usuario y el ID del usuario
    const userForToken = {
        username: user.username,
        id: user._id,
      }


      // Firmamos un token JWT con el objeto userForToken y una clave secreta almacenada en las variables de entorno
      const token = jwt.sign(
        userForToken,
        process.env.SECRET,
         
    )
    
    // Respondemos con un estado 200 y enviamos el token junto con el nombre de usuario y el nombre del usuario
    response
    .status(200)
    .send({ token, username: user.username, name: user.name, id: user.id })


})


module.exports= loginRouter