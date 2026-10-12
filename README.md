# Clínica: Cadastro de Médicos e Pacientes

Aplicação web (PWA) com API REST para cadastro de **médicos** e **pacientes**, com autenticação via **JWT** e controle de acesso por perfil (usuário comum ou administrador).

## Tecnologias

- **Back-end:** Node.js, Express, Mongoose
- **Banco de dados:** MongoDB Atlas
- **Autenticação:** JWT (jsonwebtoken) e bcryptjs para hash de senhas
- **Documentação da API:** Swagger (swagger-ui-express)
- **Front-end:** HTML, CSS e JavaScript puro, servido pelo próprio Express
- **PWA:** manifest e service worker

## Funcionalidades

- Cadastro e login de usuários do sistema
- CRUD completo de médicos (nome, CRM, especialidade, e-mail, telefone)
- CRUD completo de pacientes (nome, CPF, data de nascimento, e-mail, telefone)
- Rotas protegidas por token JWT (expira em 1 hora)
- Dois perfis de acesso:
  - **user:** apenas consulta
  - **admin:** consulta, cadastra, edita e exclui
- CRM e CPF únicos, com mensagem de erro clara em caso de duplicidade
- Documentação interativa em `/api-docs`

## Estrutura do projeto

```text
.
├── frontend/
│   ├── index.html          # login e criação de conta
│   ├── painel.html         # painel com abas Médicos e Pacientes
│   ├── auth.js
│   ├── painel.js
│   ├── style.css
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── config/swagger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── crudController.js      # CRUD genérico reaproveitado
│   │   ├── medicoController.js
│   │   └── pacienteController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Medico.js
│   │   └── Paciente.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicoRoutes.js
│   │   └── pacienteRoutes.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster ativo

## Configuração do MongoDB Atlas

1. Crie (ou retome, se estiver pausado) um cluster em **Database → Clusters**.
2. Em **Database Access**, crie um usuário de banco com senha.
3. Em **Network Access**, libere o seu IP (para deploy, adicione `0.0.0.0/0`).
4. Em **Connect → Drivers → Node.js**, copie a connection string.

## Como executar localmente

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   cd SEU_REPOSITORIO
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   # Linux/macOS
   cp .env.example .env

   # Windows (PowerShell)
   copy .env.example .env
   ```

4. Edite o `.env` com seus dados:

   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/clinica?retryWrites=true&w=majority
   JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
   ```

   > Se a senha tiver caracteres especiais (`@`, `#`, `/`, `:`), codifique-os em URL (por exemplo, `@` vira `%40`).

5. Inicie o servidor:

   ```bash
   npm run dev      # desenvolvimento (nodemon)
   npm start        # produção
   ```

6. Acesse:

   - Aplicação: <http://localhost:3000>
   - Swagger: <http://localhost:3000/api-docs>

   No terminal deve aparecer `MongoDB conectado`.

## Variáveis de ambiente

| Variável         | Descrição                                                                 | Obrigatória |
| ---------------- | ------------------------------------------------------------------------- | ----------- |
| `PORT`           | Porta do servidor (padrão `3000`)                                         | Não         |
| `MONGO_URI`      | Connection string do MongoDB Atlas                                        | Sim         |
| `JWT_SECRET`     | Segredo usado para assinar os tokens JWT                                  | Sim         |
| `USE_PUBLIC_DNS` | `true` força o uso do DNS do Google/Cloudflare (corrige `querySrv ECONNREFUSED`) | Não         |

## Como usar

1. Na tela inicial, em **Criar conta**, preencha nome, e-mail e senha e escolha o perfil.
   Escolha **Administrador** para poder cadastrar, editar e excluir.
2. Faça login em **Entrar**.
3. No painel, alterne entre as abas **Médicos** e **Pacientes** para gerenciar os registros.

## Endpoints da API

| Método | Rota                    | Acesso   | Descrição                  |
| ------ | ----------------------- | -------- | -------------------------- |
| POST   | `/api/auth/register`    | Público  | Cadastra usuário do sistema |
| POST   | `/api/auth/login`       | Público  | Autentica e retorna o JWT  |
| GET    | `/api/medicos`          | Logado   | Lista médicos              |
| GET    | `/api/medicos/:id`      | Logado   | Busca médico por id        |
| POST   | `/api/medicos`          | Admin    | Cadastra médico            |
| PUT    | `/api/medicos/:id`      | Admin    | Atualiza médico            |
| DELETE | `/api/medicos/:id`      | Admin    | Remove médico              |
| GET    | `/api/pacientes`        | Logado   | Lista pacientes            |
| GET    | `/api/pacientes/:id`    | Logado   | Busca paciente por id      |
| POST   | `/api/pacientes`        | Admin    | Cadastra paciente          |
| PUT    | `/api/pacientes/:id`    | Admin    | Atualiza paciente          |
| DELETE | `/api/pacientes/:id`    | Admin    | Remove paciente            |

As rotas protegidas exigem o cabeçalho:

```text
Authorization: Bearer <token>
```

## Deploy (Render)

1. Envie o projeto para o GitHub (o arquivo `.env` **não** deve ser enviado).
2. No [Render](https://render.com), crie um **New → Web Service** e conecte o repositório.
3. Configure:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Em **Environment**, cadastre `MONGO_URI` e `JWT_SECRET`.
5. No Atlas, confirme que **Network Access** permite `0.0.0.0/0`.
6. Acesse a URL gerada pelo Render.

> No plano gratuito, o serviço "dorme" após alguns minutos sem acesso, e a primeira requisição pode demorar cerca de um minuto.

## Problemas comuns

- **`querySrv ECONNREFUSED`:** o DNS da sua rede recusou a consulta SRV. Adicione `USE_PUBLIC_DNS=true` ao `.env`, troque o DNS do sistema para `8.8.8.8`, ou use a connection string sem `+srv` do Atlas.
- **`bad auth`:** usuário ou senha do banco incorretos (ou senha sem codificação de caracteres especiais).
- **`Server selection timed out`:** seu IP não está liberado em **Network Access** no Atlas, ou o cluster está pausado.
- **Alterações no front-end não aparecem:** o service worker pode estar servindo versão antiga. Use F12 → Application → Service Workers → *Update on reload*.

## Observações de segurança

Este projeto tem finalidade didática. O cadastro público permite escolher o perfil `admin`, o que **não deve** ser mantido em produção. Para produção, restrinja a criação de administradores e adicione validações mais completas.

## Autor

Desenvolvido por **SEU NOME** para fins acadêmicos.