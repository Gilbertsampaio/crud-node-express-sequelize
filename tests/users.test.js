const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const User = require("../models/user");

describe("API Users", () => {
  let userId;

  // Limpa tabela antes de cada teste
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  // Fecha conexão depois dos testes
  afterAll(async () => {
    await sequelize.close();
  });

  // --- CRUD básico ---

  it("deve criar um usuário", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Teste User", email: "teste@exemplo.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    userId = res.body.id;
  });

  it("deve listar todos os usuários", async () => {
    await User.create({ name: "List User", email: "list@exemplo.com", password: "123456" });

    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve atualizar um usuário", async () => {
    const novoUser = await User.create({ name: "Old Name", email: "old@exemplo.com", password: "123456" });

    const res = await request(app)
      .put(`/api/users/${novoUser.id}`)
      .send({ name: "User Atualizado", email: "novoemail@exemplo.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("User Atualizado");
  });

  it("deve deletar um usuário", async () => {
    const user = await User.create({ name: "Delete User", email: "delete@exemplo.com", password: "123456" });

    const res = await request(app).delete(`/api/users/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Usuário deletado com sucesso");
  });

  // --- Validações POST ---

  it("não deve criar usuário sem nome", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ email: "semnome@exemplo.com", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Nome é obrigatório.");
  });

  it("não deve criar usuário sem email", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Sem Email", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("E-mail é obrigatório.");
  });

  it("não deve criar usuário com email inválido", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Email Ruim", email: "ruim", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Email inválido");
  });

  it("não deve criar usuário com email duplicado", async () => {
    await User.create({ name: "Original", email: "dup@exemplo.com", password: "123456" });

    const res = await request(app)
      .post("/api/users")
      .send({ name: "Duplicado", email: "dup@exemplo.com", password: "123456" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Este email já está cadastrado");
  });

  // --- Validação PUT (atualização) ---

  it("não deve atualizar usuário com email duplicado", async () => {
    const user1 = await User.create({ name: "User 1", email: "user1@exemplo.com", password: "123456" });
    const user2 = await User.create({ name: "User 2", email: "user2@exemplo.com", password: "123456" });

    const res = await request(app)
      .put(`/api/users/${user2.id}`)
      .send({ email: "user1@exemplo.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Este email já está cadastrado");
  });
});
