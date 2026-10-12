// Gera list/findById/create/update/remove para qualquer model.
// "campos" é a lista de campos permitidos (evita gravar o que não deveria).
function tratarErro(err, res) {
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ')
    return res.status(400).json({ mensagem: msg })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ mensagem: 'ID inválido' })
  }
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern || {})[0] || 'campo'
    return res.status(409).json({ mensagem: `Já existe um registro com este ${campo}` })
  }
  console.error(err)
  return res.status(500).json({ mensagem: 'Erro interno do servidor' })
}

function criarCrud(Model, campos, nomeRegistro) {
  const filtrar = body => {
    const dados = {}
    campos.forEach(c => {
      if (body[c] !== undefined) dados[c] = body[c]
    })
    return dados
  }

  return {
    async list(req, res) {
      try {
        res.json(await Model.find().sort({ nome: 1 }))
      } catch (err) { tratarErro(err, res) }
    },

    async findById(req, res) {
      try {
        const item = await Model.findById(req.params.id)
        if (!item) return res.status(404).json({ mensagem: `${nomeRegistro} não encontrado(a)` })
        res.json(item)
      } catch (err) { tratarErro(err, res) }
    },

    async create(req, res) {
      try {
        res.status(201).json(await Model.create(filtrar(req.body)))
      } catch (err) { tratarErro(err, res) }
    },

    async update(req, res) {
      try {
        const item = await Model.findByIdAndUpdate(
          req.params.id,
          filtrar(req.body),
          { new: true, runValidators: true }
        )
        if (!item) return res.status(404).json({ mensagem: `${nomeRegistro} não encontrado(a)` })
        res.json(item)
      } catch (err) { tratarErro(err, res) }
    },

    async remove(req, res) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id)
        if (!item) return res.status(404).json({ mensagem: `${nomeRegistro} não encontrado(a)` })
        res.json({ mensagem: `${nomeRegistro} removido(a)` })
      } catch (err) { tratarErro(err, res) }
    }
  }
}

module.exports = { criarCrud, tratarErro }
