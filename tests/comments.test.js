const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const { User, Category, News, Comment } = require('../models/index');
const path = require('path');

describe("Comments API", () => {
    const tableName = "news";
    let userId;
    let categoryId;
    let recordId;
    let commentId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Cria usuário
        const user = await User.create({
            name: "User Teste",
            email: "user@teste.com",
            password: "123456"
        });
        userId = user.id;

        // Cria categoria
        const category = await Category.create({
            name: "Categoria Teste",
            description: "Descrição Teste"
        });
        categoryId = category.id;

        // Cria novidade
        const news = await News.create({
            title: "Novidade Teste",
            description: "Conteúdo da novidade",
            userId: userId,
            categoryId: categoryId,
            image: path.join(__dirname, "fixtures/test.jpg")
        });
        recordId = news.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test("Deve criar um comentário", async () => {
        const res = await request(app)
            .post("/api/comments")
            .send({ table_name: tableName, record_id: recordId, user_id: userId, content: "Comentário de teste" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body.content).toBe("Comentário de teste");

        commentId = res.body.id;
    });

    test("Deve listar comentários de uma novidade", async () => {
        const res = await request(app)
            .get(`/api/comments/news/${recordId}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("content", "Comentário de teste");
    });

    test("Deve deletar um comentário", async () => {
        const res = await request(app)
            .delete(`/api/comments/${commentId}?user_id=${userId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Comentário excluído com sucesso");

        const comment = await Comment.findByPk(commentId);
        expect(comment).toBeNull();
    });

    test("Não deve deletar comentário inexistente", async () => {
        const res = await request(app)
            .delete(`/api/comments/9999?user_id=${userId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "Comentário não encontrado");
    });
});
