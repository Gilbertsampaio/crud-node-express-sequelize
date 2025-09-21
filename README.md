# 📦 Projeto API Users & Services com Node.js, Express, Sequelize e Frontend React

Este projeto é uma aplicação completa para gerenciar **usuários** e seus **serviços**, com backend em Node.js e frontend em React.

---

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js, Express, Sequelize, MySQL 8.0
- **Frontend:** React, React Router, Axios, Bootstrap, React Icons
- Postman (para testes manuais)
- Jest + Supertest (para testes automatizados)

---

## ⚙️ Setup do Projeto

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

---

### 2. Instalar dependências

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### 3. Configurar o banco de dados MySQL

```sql
CREATE DATABASE usuarios_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- Atualize as credenciais no arquivo `config/database.js` (`usuário`, `senha` e `host`).

---

## 📁 Estrutura do Projeto

### Backend

- `server.js` → Inicialização do servidor Express
- `app.js` → Configuração do servidor Express e rotas principais
- `models/` → Modelos Sequelize (`user.js`, `service.js`)
- `routes/` → Rotas CRUD (`userRoutes.js`, `serviceRoutes.js`)
- `tests/` → Testes automatizados com Jest e Supertest

### Frontend

- `frontend/src/` → Código do React
  - `components/` → Componentes reutilizáveis (Table, Button, Form)
  - `pages/` → Páginas do React (UserList, UserForm, ServiceList, ServiceForm)
  - `api/` → Configuração do Axios para chamadas à API
  - `App.js` → Rotas principais usando React Router

---

## 🔁 Rotas da API

### Usuários
- **POST** `/api/users` → Criar usuário
- **GET** `/api/users` → Listar todos os usuários
- **PUT** `/api/users/:id` → Atualizar usuário
- **DELETE** `/api/users/:id` → Deletar usuário

### Serviços
- **POST** `/api/services` → Criar serviço
- **GET** `/api/services` → Listar todos os serviços
- **GET** `/api/users/:userId/services` → Listar serviços de um usuário
- **GET** `/api/services/:id` → Listar serviço específico
- **PUT** `/api/services/:id` → Atualizar serviço
- **DELETE** `/api/services/:id` → Deletar serviço

---

## 💻 Funcionalidades do Frontend

- Listagem de **usuários** e **serviços** com tabela interativa
- Formulários de **criação** e **edição** de usuários e serviços
- Botões de ação: criar, editar, deletar, voltar
- Consumo da API backend via Axios
- Rotas protegidas e navegação com React Router
- Feedback visual e mensagens de validação
- Layout responsivo com Bootstrap

---

## ▶️ Como rodar o projeto

**Backend:**
```bash
node server.js
```
Servidor disponível em: [http://localhost:3000](http://localhost:3000)

**Frontend:**
```bash
cd frontend
npm run dev
```
Servidor disponível em: [http://localhost:3001](http://localhost:3001) (ou porta configurada)

---

## 🧪 Testes Automatizados com Jest

Todos os endpoints da API possuem testes automatizados usando **Jest + Supertest**.

```bash
npm test
```

O que é testado:
- CRUD completo de **usuários** e **serviços**
- Validações de campos obrigatórios e emails únicos
- Listagens de serviços (todos, por usuário, por ID)
- Mensagens de erro padronizadas

---

## 👤 Autoria

Desenvolvido por **Gilbert Sampaio**

