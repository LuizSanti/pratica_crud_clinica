const mongoose = require('mongoose')

const medicoSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'Nome é obrigatório'], trim: true },
  crm: { type: String, required: [true, 'CRM é obrigatório'], unique: true, trim: true },
  especialidade: { type: String, required: [true, 'Especialidade é obrigatória'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  telefone: { type: String, trim: true }
}, { timestamps: true })

module.exports = mongoose.model('Medico', medicoSchema)
