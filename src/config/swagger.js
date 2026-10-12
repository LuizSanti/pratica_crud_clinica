const bearer = [{ bearerAuth: [] }]
const idParam = [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }]
const json = ref => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } }
})

function crudPaths(rota, tag, schema, singular) {
  return {
    [`/api/${rota}`]: {
      get: { summary: `Lista ${tag.toLowerCase()}`, tags: [tag], security: bearer, responses: { 200: { description: `Lista de ${tag.toLowerCase()}` } } },
      post: { summary: `Cadastra ${singular}`, tags: [tag], security: bearer, requestBody: json(schema), responses: { 201: { description: 'Cadastrado' }, 403: { description: 'Apenas admin' } } }
    },
    [`/api/${rota}/{id}`]: {
      get: { summary: `Busca ${singular} por id`, tags: [tag], security: bearer, parameters: idParam, responses: { 200: { description: 'Encontrado' }, 404: { description: 'Não encontrado' } } },
      put: { summary: `Atualiza ${singular}`, tags: [tag], security: bearer, parameters: idParam, requestBody: json(schema), responses: { 200: { description: 'Atualizado' }, 403: { description: 'Apenas admin' } } },
      delete: { summary: `Remove ${singular}`, tags: [tag], security: bearer, parameters: idParam, responses: { 200: { description: 'Removido' }, 403: { description: 'Apenas admin' } } }
    }
  }
}

const str = { type: 'string' }

const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'API Clínica - Médicos e Pacientes (JWT)', version: '1.0.0' },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Usuario: { type: 'object', properties: { nome: str, email: str, senha: str, role: { type: 'string', enum: ['user', 'admin'] } } },
      Login: { type: 'object', properties: { email: str, senha: str } },
      Medico: { type: 'object', required: ['nome', 'crm', 'especialidade'], properties: { nome: str, crm: str, especialidade: str, email: str, telefone: str } },
      Paciente: { type: 'object', required: ['nome', 'cpf'], properties: { nome: str, cpf: str, dataNascimento: { type: 'string', format: 'date' }, email: str, telefone: str } }
    }
  },
  paths: {
    '/api/auth/register': { post: { summary: 'Cadastra um usuário do sistema', tags: ['Autenticação'], requestBody: json('Usuario'), responses: { 201: { description: 'Usuário cadastrado' } } } },
    '/api/auth/login': { post: { summary: 'Realiza login', tags: ['Autenticação'], requestBody: json('Login'), responses: { 200: { description: 'Login realizado' } } } },
    ...crudPaths('medicos', 'Médicos', 'Medico', 'médico'),
    ...crudPaths('pacientes', 'Pacientes', 'Paciente', 'paciente')
  }
}

module.exports = swaggerSpec
