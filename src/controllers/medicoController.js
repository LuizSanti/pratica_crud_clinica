const Medico = require('../models/Medico')
const { criarCrud } = require('./crudController')

module.exports = criarCrud(
  Medico,
  ['nome', 'crm', 'especialidade', 'email', 'telefone'],
  'Médico'
)
