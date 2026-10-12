const api = '/api'
const token = localStorage.getItem('token')

if (!token) {
  window.location.href = '/'
}

const entidades = {
  medicos: {
    singular: 'médico',
    plural: 'Médicos',
    campos: [
      { id: 'nome', label: 'Nome', placeholder: 'Nome completo' },
      { id: 'crm', label: 'CRM', placeholder: 'Ex.: CRM-PE 12345' },
      { id: 'especialidade', label: 'Especialidade', placeholder: 'Ex.: Cardiologia' },
      { id: 'email', label: 'E-mail', type: 'email', placeholder: 'email@exemplo.com' },
      { id: 'telefone', label: 'Telefone', placeholder: '(81) 99999-9999' }
    ],
    detalhe: m => `${m.especialidade || ''} • CRM ${m.crm || ''}`,
    contato: m => [m.email, m.telefone].filter(Boolean).join(' • ')
  },
  pacientes: {
    singular: 'paciente',
    plural: 'Pacientes',
    campos: [
      { id: 'nome', label: 'Nome', placeholder: 'Nome completo' },
      { id: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
      { id: 'dataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'email', label: 'E-mail', type: 'email', placeholder: 'email@exemplo.com' },
      { id: 'telefone', label: 'Telefone', placeholder: '(81) 99999-9999' }
    ],
    detalhe: p => `CPF ${p.cpf || ''}${p.dataNascimento ? ' • Nasc. ' + formatarData(p.dataNascimento) : ''}`,
    contato: p => [p.email, p.telefone].filter(Boolean).join(' • ')
  }
}

let abaAtual = 'medicos'
let registros = []
let editandoId = null

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = '/'
}

function escapar(texto) {
  const div = document.createElement('div')
  div.textContent = texto ?? ''
  return div.innerHTML
}

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function mostrarStatus(texto) {
  document.getElementById('statusCrud').innerText = texto
}

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${api}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (resposta.status === 401) {
    logout()
    return null
  }

  const dados = await resposta.json().catch(() => ({}))
  return { ok: resposta.ok, status: resposta.status, dados }
}

function desenharFormulario() {
  const entidade = entidades[abaAtual]
  const registro = registros.find(r => r._id === editandoId) || {}

  document.getElementById('formCampos').innerHTML = entidade.campos.map(c => {
    let valor = registro[c.id] || ''
    if (c.type === 'date' && valor) valor = String(valor).slice(0, 10)

    return `
      <label for="campo-${c.id}">${c.label}</label>
      <input id="campo-${c.id}" type="${c.type || 'text'}"
        placeholder="${c.placeholder || ''}" value="${escapar(valor).replace(/"/g, '&quot;')}">
    `
  }).join('')

  document.getElementById('tituloForm').innerText =
    editandoId ? `Editar ${entidade.singular}` : `Novo ${entidade.singular}`
  document.getElementById('btnSalvar').innerText = editandoId ? 'Salvar alterações' : 'Cadastrar'
  document.getElementById('btnCancelar').hidden = !editandoId
  document.getElementById('tituloLista').innerText = `${entidade.plural} cadastrados`
}

function trocarAba(aba) {
  abaAtual = aba
  editandoId = null
  mostrarStatus('')

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.getElementById(`tab-${aba}`).classList.add('active')

  desenharFormulario()
  listar()
}

async function listar() {
  const resposta = await requisitar(`/${abaAtual}`)
  if (!resposta) return

  if (!resposta.ok) {
    mostrarStatus(resposta.dados.mensagem || 'Erro ao listar')
    return
  }

  registros = resposta.dados
  const entidade = entidades[abaAtual]
  const div = document.getElementById('lista')

  if (registros.length === 0) {
    div.innerHTML = `<p class="muted">Nenhum ${entidade.singular} cadastrado ainda.</p>`
    return
  }

  div.innerHTML = registros.map(r => `
    <article class="user-item">
      <div class="user-info">
        <div class="avatar">${escapar((r.nome || '?').charAt(0).toUpperCase())}</div>
        <div>
          <strong>${escapar(r.nome)}</strong>
          <span>${escapar(entidade.detalhe(r))}</span>
          <small>${escapar(entidade.contato(r))}</small>
        </div>
      </div>
      <div class="actions">
        <button class="secondary small" data-acao="editar" data-id="${r._id}">Editar</button>
        <button class="danger small" data-acao="excluir" data-id="${r._id}">Excluir</button>
      </div>
    </article>
  `).join('')
}

document.getElementById('lista').addEventListener('click', evento => {
  const botao = evento.target.closest('button[data-acao]')
  if (!botao) return

  if (botao.dataset.acao === 'editar') editar(botao.dataset.id)
  if (botao.dataset.acao === 'excluir') excluir(botao.dataset.id)
})

function editar(id) {
  editandoId = id
  mostrarStatus('')
  desenharFormulario()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  editandoId = null
  mostrarStatus('')
  desenharFormulario()
}

async function salvar() {
  const entidade = entidades[abaAtual]
  const body = {}

  entidade.campos.forEach(c => {
    body[c.id] = document.getElementById(`campo-${c.id}`).value
  })

  const resposta = await requisitar(
    editandoId ? `/${abaAtual}/${editandoId}` : `/${abaAtual}`,
    { method: editandoId ? 'PUT' : 'POST', body: JSON.stringify(body) }
  )
  if (!resposta) return

  if (resposta.status === 403) {
    mostrarStatus('Apenas administradores podem cadastrar, editar ou excluir')
    return
  }

  if (!resposta.ok) {
    mostrarStatus(resposta.dados.mensagem || 'Erro ao salvar')
    return
  }

  mostrarStatus(editandoId ? 'Alterações salvas' : `${entidade.singular} cadastrado com sucesso`)
  editandoId = null
  desenharFormulario()
  listar()
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) return

  const resposta = await requisitar(`/${abaAtual}/${id}`, { method: 'DELETE' })
  if (!resposta) return

  if (resposta.status === 403) {
    mostrarStatus('Apenas administradores podem cadastrar, editar ou excluir')
    return
  }

  if (!resposta.ok) {
    mostrarStatus(resposta.dados.mensagem || 'Erro ao excluir')
    return
  }

  mostrarStatus('Registro removido')
  listar()
}

try {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  if (usuario.nome) {
    document.getElementById('usuarioLogado').innerText =
      `${usuario.nome} (${usuario.role === 'admin' ? 'administrador' : 'usuário'})`
  }
} catch (e) {}

desenharFormulario()
listar()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}
