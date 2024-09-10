
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title:{
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    likes: {
        type:Number,
        default:0
    },

    created_at: { type: Date, default: Date.now },
    //
    userLikes: {
        type: [String],
        default: []
      },

    //
     
  comments: [
    {
      // ID único para cada comentario, generado automáticamente usando ObjectId de Mongoose
      //id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId },
      
      // Contenido del comentario, que es un string
      comment: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },  
      
    },
  ],
 
  user: {// Esto asegura que cada blog tenga un único usuario asociado,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  /*
     user:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
     ]*/
})


blogSchema.set('toJSON', {    
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id
      delete returnedObject._id
      delete returnedObject.__v
    }
})


const Blog = mongoose.model('Blog', blogSchema)

module.exports= Blog


