const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/',async (request, response) => {
    const users = await User
        .find({}).populate('blog', {url:1,title:1,author:1, id:1, created_at:1})

        response.json(users)
})


usersRouter.post('/', async (request, response) =>{    
    const { username, name, password } = request.body;


      // Verificar si el nombre de usuario o la contraseña están ausentes
    if (!username || !password) {
        return response.status(400).json({ error:  'El nombre de usuario y la contraseña son obligatorios' });
      }
    

        // Verificar que el nombre de usuario y la contraseña tengan al menos 3 caracteres
      if (username.length < 3 || password.length < 3) {
        return response.status(400).json({ error: 'El nombre de usuario y la contraseña deben tener al menos 3 caracteres' });
      }
    
        // Verificar si el nombre de usuario ya está en uso
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    


    const saltRounds = 10;
    try { 
      // Hashear la contraseña antes de guardar el usuario
    const passwordHash= await bcrypt.hash(password, saltRounds)

      // Crear un nuevo usuario con el hash de la contraseña
    const user = new User({username,name,passwordHash})

    // Guardar el nuevo usuario en la base de datos
    const savedUser = await user.save()


      // Responder con el usuario creado y un status 201
    response.status(201).json(savedUser)
    } catch (error) {
        // Manejar errores de servidor
        console.error(error);
        response.status(500).json({ error: 'Algo salió mal' });
      }
} )


module.exports = usersRouter




