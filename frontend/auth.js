const api = '/api'

async function cadastrar() {
  const body = {
    nome: document.getElementById('nomeCadastro').value,
    email: document.getElementById('emailCadastro').value,
    senha: document.getElementById('senhaCadastro').value,
    role: document.getElementById('roleCadastro').value
  }

  const resposta = await fetch(`${api}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const dados = await resposta.json()
  const statusCadastro = document.getElementById('statusCadastro')

  if (!resposta.ok) {
    statusCadastro.innerText = dados.mensagem || 'Erro ao cadastrar'
    return
  }

  statusCadastro.innerText = `Usuário ${dados.nome} cadastrado com sucesso. Agora faça login.`
}

async function login() {
  const email = document.getElementById('emailLogin').value
  const senha = document.getElementById('senhaLogin').value
  const status = document.getElementById('statusLogin')

  const resposta = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      senha
    })
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')

    status.innerText = dados.mensagem

    return
  }

  localStorage.setItem('token', dados.token)
  localStorage.setItem('usuario', JSON.stringify(dados.usuario))

  window.location.href = '/painel.html'
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}