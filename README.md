# ?? API Users com Node.js, Express e Sequelize

Este projeto � uma **API RESTful** simples para gerenciamento de usu�rios, utilizando:

- **Node.js**
- **Express**
- **Sequelize (ORM)**
- **MySQL 8.0**
- **Postman** (para testes)

---

## ?? Tecnologias Utilizadas
- Node.js  
- Express  
- Sequelize  
- MySQL  
- Postman  

---

## ?? Setup do Projeto

### 1?? Clonar o reposit�rio
```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### 2?? Instalar depend�ncias
```bash
npm install
```

### 3?? Configurar o banco de dados MySQL
Crie o banco de dados:
```sql
CREATE DATABASE usuarios_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atualize as credenciais no arquivo **`config/database.js`** (`usu�rio`, `senha` e `host`).

---

## ?? Estrutura do Projeto

```
??? app.js              # Configura��o do servidor Express e rotas principais
??? config/
?   ??? database.js     # Conex�o com o banco de dados MySQL
??? models/
?   ??? user.js         # Modelo Sequelize da tabela Users
??? package.json
```

---

## ?? Rotas da API

### ? Criar usu�rio
**POST** `/api/users`  
Body JSON:
```json
{
  "name": "Nome do Usu�rio",
  "email": "email@exemplo.com"
}
```

---

### ?? Listar todos os usu�rios
**GET** `/api/users`

---

### ?? Atualizar usu�rio
**PUT** `/api/users/:id`  
Body JSON:
```json
{
  "name": "Novo Nome",
  "email": "novoemail@exemplo.com"
}
```

---

### ??? Deletar usu�rio
**DELETE** `/api/users/:id`

---

## ?? Como rodar o projeto

```bash
node app.js
```

O servidor ficar� dispon�vel em:  
?? [http://localhost:3000](http://localhost:3000)
