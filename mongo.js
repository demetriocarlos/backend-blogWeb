
const mongoose= require('mongoose')
const config = require('./utils/config')

const connectionString= config.MONGO_DB_URI

mongoose.connect(connectionString, {})
    .then(() => {
        console.log('database connect')
    }).catch(err =>{
        console.log(err)
    })


