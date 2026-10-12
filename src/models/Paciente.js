const mongoose = require('mongoose')

const pacienteSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  cpf: { type: String, required: [true, 'CPF é obrigatório'], unique: true, trim: true },
  dataNascimento: { type: Date },
  email: { type: String, trim: true, lowercase: true },
  telefone: { type: String, trim: true }
}, { timestamps: true })

module.exports = mongoose.model('Paciente', pacienteSchema)
