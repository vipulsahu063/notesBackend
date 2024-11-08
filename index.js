require('dotenv').config(); 
const express = require('express');
const app = express();
const Note = require('./models/note');
const cors = require('cors')
const morgan = require('morgan')

morgan.token('body', (req) => {
  JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))
app.use(cors())
app.use(express.json());

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response, next) => (
  Note.findById(request.params.id)
  .then(note => { 
    if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => { 
      next(error)
    })
  ))

  app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const newNote = new Note({
        content: body.content,
        important: body.important || false,
    })

    newNote.save()
      .then(savedNote => {
        response.json(savedNote)
      })
      .catch(error => next(error))
  })

app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body

  const newNote = new Note({
    content: content,
    important: important || false,
  })

  Note.findByIdAndUpdate(
    request.params.id, 
    newNote, 
    {content, important},
    {new: true, runValidators: true, context: 'query'}
  )
  .then(updateNote => {
    response.json(updateNote)
  })
  .catch(error => next(error))
})


app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

  
  

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
  }

  app.use(unknownEndpoint)
  
  const errorHandler = (error, request, response, next) => {
    console.log(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({error: 'malformed id'})
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({error: error.message})
    }
    
    next(error)
  }
  
  app.use(errorHandler)

  const PORT = process.env.PORT
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });