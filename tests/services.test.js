const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const { User, Service } = require('../models/index');

describe("API Services", () => {
  let userId;

  // Cria um usuário antes de todos os testes
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const user = await User.create({
      name: "User Teste",
      email: "user@teste.com",
      password: "123456"
    });

    userId = user.id;
  });

  // Limpa tabela de serviços antes de cada teste
  beforeEach(async () => {
    await Service.destroy({ where: {} });
  });

  // Fecha conexão após todos os testes
  afterAll(async () => {
    await sequelize.close();
  });

  // --- CRUD básico ---

  it("deve criar um serviço", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ title: "Serviço Teste", description: "Descrição", userId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Serviço Teste");
  });

  it("não deve criar serviço com userId inexistente", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ title: "Inválido", description: "Desc", userId: 9999 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Usuário não encontrado");
  });

  it("não deve criar serviço sem title", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ description: "Sem título", userId });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("O título do serviço é obrigatório");
  });

  it("deve listar todos os serviços", async () => {
    await Service.create({ title: "Serviço 1", description: "Desc", userId });

    const res = await request(app).get("/api/services");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve listar serviços de um usuário específico", async () => {
    await Service.create({ title: "Serviço Usuário", description: "Desc", userId });

    const res = await request(app).get(`/api/services/${userId}/services`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(service => expect(service.userId).toBe(userId));
  });

  it("deve listar um serviço específico", async () => {
    const service = await Service.create({ title: "Serviço Único", description: "Desc", userId });

    const res = await request(app).get(`/api/services/${service.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", service.id);
    expect(res.body).toHaveProperty("User");
    expect(res.body.User.id).toBe(userId);
  });

  it("deve atualizar um serviço", async () => {
    const service = await Service.create({ title: "Antigo", description: "Desc", userId });

    const res = await request(app)
      .put(`/api/services/${service.id}`)
      .send({ title: "Atualizado", description: "Nova Desc" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Atualizado");
  });

  it("não deve atualizar serviço para userId inexistente", async () => {
    const service = await Service.create({ title: "Serviço", description: "Desc", userId });

    const res = await request(app)
      .put(`/api/services/${service.id}`)
      .send({ userId: 9999 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Usuário não encontrado");
  });

  it("deve deletar um serviço", async () => {
    const service = await Service.create({ title: "Excluir", description: "Desc", userId });

    const res = await request(app).delete(`/api/services/${service.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Serviço deletado com sucesso");
  });

  it("não deve deletar serviço inexistente", async () => {
    const res = await request(app).delete("/api/services/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Serviço não encontrado");
  });
});
