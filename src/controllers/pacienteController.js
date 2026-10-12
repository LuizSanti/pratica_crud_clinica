const Paciente = require('../models/Paciente')
const { criarCrud } = require('./crudController')

module.exports = criarCrud(
  Paciente,
  ['nome', 'cpf', 'dataNascimento', 'email', 'telefone'],
  'Paciente'
)
