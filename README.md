# 📦 Projeto API Users & Services com Node.js, Express e Sequelize

Este projeto é uma API simples para gerenciar **usuários** e seus **serviços**, utilizando **Node.js**, **Express**, **Sequelize** e **MySQL**.

---

## 🚀 Tecnologias Utilizadas

- Node.js  
- Express  
- Sequelize (ORM)  
- MySQL 8.0  
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

```bash
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

- `app.js` → Configuração do servidor Express e rotas principais  
- `models/user.js` → Modelo Sequelize da tabela `Users`  
- `models/service.js` → Modelo Sequelize da tabela `Services`  
- `routes/userRoutes.js` → Rotas CRUD de usuários  
- `routes/serviceRoutes.js` → Rotas CRUD de serviços  
- `tests/` → Testes automatizados com Jest e Supertest  

---

## 🔁 Rotas da API

### Usuários

#### ✅ Criar usuário

- **POST** `/api/users`  
Body JSON:

```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com"
}
```

- Validações:
  - `name` obrigatório → "O nome é obrigatório"  
  - `email` obrigatório → "O email é obrigatório"  
  - `email` único → "Este email já está cadastrado"  
  - `email` válido → "Email inválido"

#### 📄 Listar todos os usuários

- **GET** `/api/users`

#### ✏️ Atualizar usuário

- **PUT** `/api/users/:id`  
Body JSON:

```json
{
  "name": "Novo Nome",
  "email": "novoemail@exemplo.com"
}
```

- Retorna 404 se usuário não encontrado.

#### 🗑️ Deletar usuário

- **DELETE** `/api/users/:id`

---

### Serviços

#### ✅ Criar serviço

- **POST** `/api/services`  
Body JSON:

```json
{
  "title": "Título do Serviço",
  "description": "Descrição do serviço",
  "userId": 1
}
```

- Validações:
  - `title` obrigatório → "O título do serviço é obrigatório"  
  - `userId` deve existir → "Usuário não encontrado"

#### 📄 Listar todos os serviços

- **GET** `/api/services`  
Inclui os dados do usuário associado.

#### 📄 Listar serviços de um usuário

- **GET** `/api/users/:userId/services`

#### 📄 Listar serviço específico

- **GET** `/api/services/:id`

#### ✏️ Atualizar serviço

- **PUT** `/api/services/:id`  
Body JSON:

```json
{
  "title": "Novo título",
  "description": "Nova descrição"
}
```

- Retorna 404 se serviço não encontrado.  
- Validações aplicadas (mesmas do create).

#### 🗑️ Deletar serviço

- **DELETE** `/api/services/:id`  
- Retorna 404 se serviço não encontrado.

---

## ▶️ Como rodar o projeto

```bash
node server.js
```

- O servidor ficará disponível em: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testes Automatizados com Jest

Todos os endpoints da API possuem testes automatizados usando **Jest + Supertest**.

- Para rodar os testes:

```bash
npm test
```

- O que é testado:
  - CRUD completo de **usuários** e **serviços**  
  - Validações de campos obrigatórios e emails únicos  
  - Listagens de serviços (todos, por usuário, por ID)  
  - Mensagens de erro padronizadas

## 👤 Autoria

Desenvolvido por **Gilbert Sampaio**