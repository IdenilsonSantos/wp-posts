# 🚀 Aplicação Fullstack com Docker

Este projeto é uma aplicação **fullstack** que integra múltiplos serviços executando em contêineres **Docker**.

---

## 🧩 Stack Tecnológica

- **Backend:** [NestJS](https://nestjs.com/)
- **Frontend:** [Next.js](https://nextjs.org/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Cache:** [Redis](https://redis.io/)
- **Mock de Dados:** [JSON Server](https://github.com/typicode/json-server)

O ambiente local é orquestrado via **Docker Compose**:

- Banco de dados PostgreSQL
- Redis gerenciado
- Armazenamento seguro de variáveis sensíveis

---

## 📁 Estrutura do Projeto

```bash
/
├── apps/
│   ├── api/              # Backend (NestJS)
│   │   └── json-server/  # Mock de dados
│   └── web/              # Frontend (Next.js)
└── docker-compose.yml
```

1️⃣ Clone o Repositório
`git clone https://github.com/IdenilsonSantos/wp-posts.git`

e entre na pasta, cd wp-posts

2️⃣ Configurar Variáveis de Ambiente

###### 📦 API

Dentro da pasta apps/api, copie o arquivo .env.example e crie um novo arquivo .env:

cp apps/api/.env.example apps/api/.env

Preencha as variáveis de ambiente conforme suas credenciais (ex: banco de dados, JWT, Redis, etc).

só não altere os hosts que serão usados no docker

###### 📦 Webhook de posts

O webhook para acessar os posts está na rota `content/posts`, é uma roda de criação, sem autenticação da api ele pode ser acessado usando rest e também via curl, com os seguintes parametros:

{"title": "TESTANDO ACRIACAO",
"excerpt": "Testando a criação de mais um post",
"slug": TEC
}

Dentro da pasta está o arquivo da collection do insomnia, contendo todas as rotas utilizadas.

###### 🌐 Frontend

Repita o processo para a aplicação Next.js:

cp apps/web/.env.example apps/web/.env

###### 🐳 Executando com Docker

Com os arquivos .env devidamente configurados, na raiz do projeto, execute:

`docker-compose --env-file ./apps/api/.env --env-file ./apps/web/.env up --build`

Esse comando:

Faz o build das imagens (API, Web, Redis, PostgreSQL e JSON Server);

Sobe todos os contêineres com as variáveis de ambiente corretas.

### 🌐 Endpoints e Portas

| 🧩 Serviço    | 🔌 Porta | 📝 Descrição              |
| ------------- | -------- | ------------------------- |
| Next.js (Web) | 3002     | Interface do usuário      |
| NestJS (API)  | 3000     | Backend principal         |
| JSON Server   | 3005     | Mock de dados             |
| PostgreSQL    | 5432     | Banco de dados relacional |
| Redis         | 6379     | Cache em memória          |

Após o build, os serviços estarão disponíveis localmente em:

🖥️ Frontend: http://localhost:3002

⚙️ API: http://localhost:3000

🧾 Licença

Este projeto é distribuído sob a licença MIT.
Sinta-se à vontade para usar e modificar conforme necessário.
