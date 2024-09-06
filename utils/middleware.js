
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


// Función auxiliar para obtener el token del encabezado 'Authorization'
/*const getTokenFrom = request => {
  const authorization = request.get('authorization');
                //.toLowerCase()
  if (authorization && authorization.startsWith('Bearer ')) {
    
    return authorization.replace('Bearer ', '');
    
  }
  return null;
};*/


// Función auxiliar para obtener el token del encabezado 'Authorization'
const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7); // Extrae el token después de "Bearer "
  }
  return null;
};



// Middleware para extraer el token del encabezado y asignarlo al campo 'request.token'
const tokenExtractor = (request, response, next) => {
  request.token = getTokenFrom(request); // Extrae el token usando la función auxiliar
  next();// Llama a 'next' para pasar el control al siguiente middleware
};



const userExtractor = async (request, response, next) => {
    // Verifica si el token está presente en request.token
    if (request.token) {
      try {
        // Intenta verificar el token usando la clave secreta de las variables de entorno
        const decodedToken = jwt.verify(request.token, process.env.SECRET);
        // Si la verificación es exitosa y el token contiene un id, busca el usuario en la base de datos
        if (decodedToken.id) {
          // Asigna el usuario encontrado al objeto request para que esté disponible en los controladores
          request.user = await User.findById(decodedToken.id);
        }
      } catch (error) {
        return response.status(401).json({ error: 'token invalid' });
      }
    } else {
      return response.status(401).json({ error: 'token missing' });
    }
    next();
  };
  


  module.exports={
    userExtractor,
    tokenExtractor,
    requestLogger,
    unknownEndpoint,
    errorHandler
  }



