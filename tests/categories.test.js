const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const Category = require("../models/category");
const Service = require("../models/service");
const User = require("../models/user");

describe("API Categories", () => {
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recria tabelas

    // cria usuário para associar serviços
    const user = await User.create({ 
      name: "User Categoria", 
      email: "user@categoria.com", 
      password: "123456" 
    });
    userId = user.id;
  });

  // limpa categorias antes de cada teste
  beforeEach(async () => {
    await Category.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // --- CRUD ---

  it("deve criar uma categoria", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: "Categoria Teste", description: "Descrição" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Categoria Teste");
  });

  it("não deve criar categoria sem nome", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ description: "Sem nome" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("O nome da categoria é obrigatório");
  });

  it("deve listar todas as categorias", async () => {
    await Category.create({ name: "Cat 1", description: "Desc" });

    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve listar uma categoria específica", async () => {
    const category = await Category.create({ name: "Cat Única", description: "Desc" });

    const res = await request(app).get(`/api/categories/${category.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", category.id);
  });

  it("não deve listar categoria inexistente", async () => {
    const res = await request(app).get("/api/categories/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Categoria não encontrada");
  });

  it("deve atualizar uma categoria", async () => {
    const category = await Category.create({ name: "Antiga", description: "Desc" });

    const res = await request(app)
      .put(`/api/categories/${category.id}`)
      .send({ name: "Atualizada", description: "Nova Desc" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Atualizada");
  });

  it("não deve atualizar categoria inexistente", async () => {
    const res = await request(app)
      .put("/api/categories/9999")
      .send({ name: "Inexistente" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Categoria não encontrada");
  });

  it("deve deletar uma categoria", async () => {
    const category = await Category.create({ name: "Delete", description: "Desc" });

    const res = await request(app).delete(`/api/categories/${category.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Categoria deletada com sucesso");
  });

  it("não deve deletar categoria inexistente", async () => {
    const res = await request(app).delete("/api/categories/9999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Categoria não encontrada");
  });

  it("não deve deletar categoria vinculada a serviços", async () => {
    const category = await Category.create({ name: "Com Serviço", description: "Desc" });

    await Service.create({ 
      title: "Serviço Cat", 
      description: "Desc", 
      userId, 
      categoryId: category.id 
    });

    const res = await request(app).delete(`/api/categories/${category.id}`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Não é possível excluir a categoria, pois está associada a um ou mais serviços."
    );
  });
});
