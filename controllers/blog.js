
const blogRouter = require('express').Router()
const mongoose = require('mongoose');
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

require('dotenv').config()

blogRouter.get('/' ,async (request, response) => {
    const blog = await Blog
        .find({}).populate('user', {username:1, name:1 ,id:1})

    response.json(blog)
})


blogRouter.post('/', async (request, response, next) => {
    try {

        const {
            title, 
            url ,
            author,
            id,
            //userId
        }= request.body;// Desestructura las propiedades

        //const user = await User.findById(userId)

        if (!title || !author || !url) {
          return response.status(400).json({ error: 'Title, author, and url are required' });
        }

         // Verifica si el token está presente en la solicitud
    if (!request.token) {
        return response.status(401).json({ error: 'falta el token' });
      }
    
      //console.log('holla')

       let decodedToken;
      try {
        // Verifica y decodifica el token
        decodedToken = jwt.verify(request.token, process.env.SECRET);
      } catch (error) {
        return response.status(401).json({ error: 'token inválido' });
      }
      
  
      // Verifica si el token decodificado tiene un id válido
      if(!request.token || !decodedToken.id){
        return response.status(401).json({error: 'token missing or invalid'})
      }
  

      // Busca el usuario en la base de datos usando el id decodificado
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

      
    // Verifica si title y url están presentes en el cuerpo de la solicitud
    if (!title || !url) {
      // Si falta "title" o "url", responde con 400 Bad Request
      return response.status(400).json({ error: 'Title and URL are required' });
    }


      
        // Obtener el usuario desde el objeto de solicitud
      //const user = request.user;


        // Crea un nuevo blog usando los datos de la solicitud
        const newBlog = new Blog ({
            title, 
            url ,
            author,
            id,
            user:user._id // Asigna el id del usuario al blog
        })

        // Guarda el nuevo blog en la base de datos
        const result = await newBlog.save()

        
        // Agrega el id del nuevo blog a la lista de blogs del usuario y guarda los cambios
        user.blog = user.blog.concat(result._id)
        await user.save()


        
    // Popula el campo 'user' del resultado para incluir los detalles del usuario
    await result.populate('user', { username: 1, name: 1 }) 


        response.status(201).json(result)// Responde con el blog creado y un estado 201 (Created)

    } catch (error) {
        next(error)
    }
} )


blogRouter.delete('/:id',  async (request, response, next) => {

  try{

    // Verifica si el token está presente en la solicitud
    if (!request.token) {
      return response.status(401).json({ error: 'falta el token' });
    }


    let decodedToken;
    try {
      // Verifica y decodifica el token
      decodedToken = jwt.verify(request.token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'token inválido' });
    }

     

    // Obtener el usuario desde el objeto de solicitud
    const user = request.user;


    // Busca el blog que se quiere eliminar
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: 'blog no encontrado' });
    }


    // Verifica si el usuario autenticado es el propietario del blog
    if (blog.user.toString() !== request.user.id.toString()  /*decodedToken.id*/) {
      return response.status(403).json({ error: 'no autorizado para eliminar este blog' });
    }
  
     // Elimina el blog
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();

  }catch (error) {
    next(error);
  }
})


blogRouter.put('/:id',async (request, response, next) => {
  try{
    const body = request.body;

    
    // Verifica si el token está presente en la solicitud
    if (!request.token) {
      return response.status(401).json({ error: 'falta el token' });
    }

    
    let decodedToken;
    try {
      // Verifica y decodifica el token
      decodedToken = jwt.verify(request.token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'token inválido' });
    }

    
    // Verifica si el token decodificado tiene un id válido
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'falta el token o es inválido' });
    }


    const user = request.user;


     // Busca el blog que se quiere actualizar
     const blog = await Blog.findById(request.params.id);
     if (!blog) {
       return response.status(404).json({ error: 'blog no encontrado' });
     }


    /* // Verifica si el usuario autenticado es el propietario del blog
    if (blog.user.toString() !== decodedToken.id) {
      return response.status(403).json({ error: 'no autorizado para actualizar este blog' });
    }
*/



    // Si `blog.userLikes` está definido, asigna su valor a `userLikes`, de lo contrario asigna un array vacío `[]`.
    const userLikes = blog.userLikes || [];



     
    //const userId = decodedToken.id;
    // Comprueba si el ID del usuario decodificado (decodedToken.id) está en el array `userLikes`.
    // Devuelve `true` si el usuario ha dado like, `false` en caso contrario.
    const hasLiked = userLikes.includes(decodedToken.id);

  
     // Crea un objeto `updatedBlogData` con los datos actualizados del blog.
    const  updatedBlogData = {
      title: body.title,
      author: body.author,
      url: body.url,
      //likes: body.likes,
      // 

      // Si `hasLiked` es verdadero, disminuye el número de likes en 1.
      // Si `hasLiked` es falso, incrementa el número de likes en 1.
      likes: hasLiked ? blog.likes - 1 : blog.likes + 1,
      // Actualiza el array `userLikes`.
      // Si `hasLiked` es verdadero, elimina el ID del usuario del array `userLikes`.
      // Si `hasLiked` es falso, agrega el ID del usuario al array `userLikes`.
      userLikes: hasLiked 
        ? userLikes.filter(uid => uid !== decodedToken.id)
        : userLikes.concat(decodedToken.id),
        //

        
      id:body.id,
      user: user._id,  // Asigna el ID del usuario al campo user


       
    };

    
    // Popula el campo 'user' del blog actualizado para incluir los detalles del usuario
    
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updatedBlogData, { new: true }).populate('user', { username: 1, name: 1 });
    // Popula el campo 'user' del blog actualizado para incluir los detalles del usuario
    //await updatedBlog.populate('user', { username: 1, name: 1 });


    response.json(updatedBlog);

  } catch (error) {
    next(error);
  }
})


 
blogRouter.post('/:id/comments', async (request, response, next) => {
  try {
    // Verifica si el token está presente en la solicitud
    if (!request.token) {
      return response.status(401).json({ error: 'Token faltante' });
    }

    let decodedToken;
    try {
      // Verifica y decodifica el token
      decodedToken = jwt.verify(request.token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'Token inválido' });
    }

    // Si el token es válido, se continúa con la adición del comentario
    const { id } = request.params; // Extraemos el ID del blog desde los parámetros de la URL
    const { comment } = request.body; // Extraemos el comentario desde el cuerpo de la solicitud

    // Verificamos que el comentario no esté vacío o que no sea solo espacios en blanco
    if (!comment || comment.trim() === '') {
      return response.status(400).json({ error: 'El comentario no puede estar vacío' });
    }

    // Buscamos el blog por su ID
    const blog = await Blog.findById(id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog no encontrado' });
    }


    // Creamos un nuevo objeto de comentario con un ID único y el contenido del comentario
  const newComment = {
    //id: id /*new mongoose.Types.ObjectId()*/, // Genera un ObjectId único para el comentario
    comment: comment, // Contenido del comentario enviado en el cuerpo de la solicitud
  };


    // Agregamos el comentario al array de comentarios del blog
    blog.comments = blog.comments.concat(newComment);

    await blog.save(); // Guardamos el blog con el nuevo comentario

    // Devolvemos el blog actualizado con el nuevo comentario en una respuesta con status 201
    response.status(201).json(blog);
  } catch (error) {
    next(error);
  }
});



module.exports = blogRouter

