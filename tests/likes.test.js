const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const { User, Category, News, Like } = require('../models/index');
const path = require('path');

describe("Likes API", () => {
    const tableName = "news";
    let userId;
    let recordId;
    let categoryId;

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
        recordId = news.id; // agora recordId realmente existe
    });

    // beforeAll(async () => {
    //     try {
    //         console.log("Iniciando a sincronização do banco de dados...");
    //         await sequelize.sync({ force: true });
    //         console.log("Banco de dados sincronizado. Tentando criar o usuário...");

    //         const user = await User.create({
    //             name: "User Teste",
    //             email: "user@teste.com",
    //             password: "123456"
    //         });

    //         userId = user.id;

    //         // Verificação adicional: o usuário realmente existe no banco?
    //         const userCreated = await User.findByPk(userId);

    //         if (userCreated) {
    //             console.log("✅ Usuário criado com sucesso! ID:", userId);
    //         } else {
    //             console.error("❌ Erro: O usuário não foi encontrado no banco de dados após a criação.");
    //         }
    //     } catch (error) {
    //         console.error("❌ Erro no beforeAll durante a criação do usuário:", error);
    //         // Se houver um erro, é importante parar os testes
    //         throw error;
    //     }
    // });

    afterAll(async () => {
        await sequelize.close();
    });

    test("Deve curtir um registro", async () => {
        const res = await request(app)
            .post("/api/likes/toggle")
            .send({ table_name: tableName, record_id: recordId, user_id: userId });

        expect(res.statusCode).toBe(200);
        expect(res.body.liked).toBe(true);

        const like = await Like.findOne({ where: { table_name: tableName, record_id: recordId, user_id: userId } });
        expect(like).not.toBeNull();
    });

    test("Deve retornar status de curtida", async () => {
        const res = await request(app)
            .get("/api/likes/status")
            .query({ table_name: tableName, record_id: recordId, user_id: userId });

        expect(res.statusCode).toBe(200);
        expect(res.body.liked).toBe(true);
        expect(res.body.total).toBe(1);
    });

    test("Deve listar usuários que curtiram", async () => {
        const res = await request(app)
            .get(`/api/likes/users/${tableName}/${recordId}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toContain("User Teste");
    });

    test("Deve descurtir um registro", async () => {
        const res = await request(app)
            .post("/api/likes/toggle")
            .send({ table_name: tableName, record_id: recordId, user_id: userId });

        expect(res.statusCode).toBe(200);
        expect(res.body.liked).toBe(false);

        const like = await Like.findOne({ where: { table_name: tableName, record_id: recordId, user_id: userId } });
        expect(like).toBeNull();
    });
});
