const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const User = require("../models/user");
const Category = require("../models/category");
const News = require("../models/news");
const path = require("path");

describe("API News", () => {
  let userId;
  let categoryId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const user = await User.create({
      name: "User Teste",
      email: "user@teste.com",
      password: "123456"
    });
    userId = user.id;

    const category = await Category.create({
      name: "Categoria Teste"
    });
    categoryId = category.id;
  });

  beforeEach(async () => {
    await News.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // --- CRUD de Novidades ---

  it("deve criar uma novidade", async () => {
    const res = await request(app)
      .post("/api/news")
      .field("title", "Novidade Teste")
      .field("description", "Descrição da novidade")
      .field("userId", userId)
      .field("categoryId", categoryId)
      .attach("image", path.join(__dirname, "fixtures/test.jpg"));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Novidade Teste");
    expect(res.body).toHaveProperty("image");
  });

  it("não deve criar novidade sem imagem", async () => {
    const res = await request(app)
      .post("/api/news")
      .field("title", "Sem Imagem")
      .field("description", "Desc")
      .field("userId", userId)
      .field("categoryId", categoryId);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "A imagem da novidade é obrigatória.");
  });

  it("não deve criar novidade com usuário inexistente", async () => {
    const res = await request(app)
      .post("/api/news")
      .field("title", "Inválida")
      .field("description", "Desc")
      .field("userId", 9999)
      .field("categoryId", categoryId)
      .attach("image", path.join(__dirname, "fixtures/test.jpg"));

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Usuário não encontrado");
  });

  it("não deve criar novidade com categoria inexistente", async () => {
    const res = await request(app)
      .post("/api/news")
      .field("title", "Inválida")
      .field("description", "Desc")
      .field("userId", userId)
      .field("categoryId", 9999)
      .attach("image", path.join(__dirname, "fixtures/test.jpg"));

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Categoria não encontrada");
  });

  it("deve listar todas as novidades", async () => {
    await News.create({ title: "Nova", description: "Desc", userId, categoryId, image: "fake.png" });

    const res = await request(app).get("/api/news");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve listar novidades de um usuário específico", async () => {
    await News.create({ title: "Minha", description: "Desc", userId, categoryId, image: "fake.png" });

    const res = await request(app).get(`/api/news/my/${userId}`);
    expect(res.statusCode).toBe(200);
    res.body.forEach(n => expect(n.userId).toBe(userId));
  });

  it("deve listar uma novidade específica", async () => {
    const news = await News.create({ title: "Detalhe", description: "Desc", userId, categoryId, image: "fake.png" });

    const res = await request(app).get(`/api/news/${news.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", news.id);
    expect(res.body).toHaveProperty("User");
    expect(res.body).toHaveProperty("Category");
  });

  it("deve atualizar uma novidade", async () => {
    const news = await News.create({ title: "Velha", description: "Desc", userId, categoryId, image: "fake.png" });

    const res = await request(app)
      .put(`/api/news/${news.id}`)
      .field("title", "Atualizada")
      .field("description", "Nova Desc")
      .attach("image", path.join(__dirname, "fixtures/test.jpg"));

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Atualizada");
  });

  it("não deve atualizar novidade inexistente", async () => {
    const res = await request(app)
      .put("/api/news/9999")
      .field("title", "Teste")
      .field("description", "Desc");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Novidade não encontrada");
  });

  it("deve deletar uma novidade", async () => {
    const news = await News.create({ title: "Excluir", description: "Desc", userId, categoryId, image: "fake.png" });

    const res = await request(app).delete(`/api/news/${news.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Novidade deletada com sucesso");
  });

  it("não deve deletar novidade inexistente", async () => {
    const res = await request(app).delete("/api/news/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Novidade não encontrada");
  });
});
