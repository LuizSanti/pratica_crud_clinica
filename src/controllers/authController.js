const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function register(req, res) {
  try {
    if (!req.body.nome || !req.body.email || !req.body.senha) {
      return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios' })
    }

    const senhaHash = await bcrypt.hash(req.body.senha, 10)

    const user = await User.create({
      nome: req.body.nome,
      email: req.body.email,
      senha: senhaHash,
      role: req.body.role || 'user'
    })

    res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' })
    }
    console.error(err)
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' })
  }
}

async function login(req, res) {
  try {
    const user = await User.findOne({
      email: req.body.email
    })

    if (!user) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      })
    }

    const senhaValida = await bcrypt.compare(
      req.body.senha,
      user.senha
    )

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        nome: user.nome,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    res.json({
      token,
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ mensagem: 'Erro ao fazer login' })
  }
}

module.exports = {
  register,
  login
}