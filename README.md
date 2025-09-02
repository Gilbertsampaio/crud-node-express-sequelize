# 📦 API Users com Node.js, Express e Sequelize

Este projeto é uma **API RESTful** simples para gerenciamento de usuários, utilizando:

- **Node.js**
- **Express**
- **Sequelize (ORM)**
- **MySQL 8.0**
- **Postman** (para testes)

---

## 🚀 Tecnologias Utilizadas
- Node.js  
- Express  
- Sequelize  
- MySQL  
- Postman  

---

## ⚙️ Setup do Projeto

### 1️⃣ Clonar o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Configurar o banco de dados MySQL
Crie o banco de dados:
```sql
CREATE DATABASE usuarios_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atualize as credenciais no arquivo **`config/database.js`** (`usuário`, `senha` e `host`).

---

## 📁 Estrutura do Projeto

```
├── app.js              # Configuração do servidor Express e rotas principais
├── config/
│   └── database.js     # Conexão com o banco de dados MySQL
├── models/
│   └── user.js         # Modelo Sequelize da tabela Users
└── package.json
```

---

## 🔁 Rotas da API

### ✅ Criar usuário
**POST** `/api/users`  
Body JSON:
```json
{
  "name": "Nome do Usuário",
  "email": "email@exemplo.com"
}
```

---

### 📄 Listar todos os usuários
**GET** `/api/users`

---

### ✏️ Atualizar usuário
**PUT** `/api/users/:id`  
Body JSON:
```json
{
  "name": "Novo Nome",
  "email": "novoemail@exemplo.com"
}
```

---

### 🗑️ Deletar usuário
**DELETE** `/api/users/:id`

---

## ▶️ Como rodar o projeto

```bash
node app.js
```

O servidor ficará disponível em:  
👉 [http://localhost:3000](http://localhost:3000)
