
require('dotenv').config()
const express = require('express')
const app= express()
const cors = require('cors')


const blogRouter = require('./controllers/blog')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

require('./mongo')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
 

// Registra el middleware tokenExtractor para que se aplique a todas las rutas
app.use(middleware.tokenExtractor);


app.use(middleware.requestLogger)


app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use('/api/users', usersRouter)

app.use('/api/login',loginRouter)

app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)

module.exports = app

