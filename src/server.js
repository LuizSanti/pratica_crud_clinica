require('dotenv').config()

if (process.env.USE_PUBLIC_DNS === 'true') {
  require('dns').setServers(['8.8.8.8', '1.1.1.1'])
}

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const authRoutes = require('./routes/authRoutes')
const medicoRoutes = require('./routes/medicoRoutes')
const pacienteRoutes = require('./routes/pacienteRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/api/auth', authRoutes)
app.use('/api/medicos', medicoRoutes)
app.use('/api/pacientes', pacienteRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro no MongoDB:', err.message))

const porta = process.env.PORT || 3000

app.listen(porta, () => {
  console.log(`Servidor em http://localhost:${porta}`)
  console.log(`Swagger em http://localhost:${porta}/api-docs`)
})
