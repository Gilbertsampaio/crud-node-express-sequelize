const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/database");
const { User, Story, StoryView } = require("../models/index");
const path = require('path');

describe("Stories API", () => {
    let userId;
    let storyId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const user = await User.create({
            name: "User Teste",
            email: "user@teste.com",
            password: "123456"
        });
        userId = user.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test("Deve criar uma story", async () => {
        const res = await request(app)
            .post("/api/stories")
            .send({ user_id: userId, media_url: path.join(__dirname, "fixtures/test.jpg"), type: "image" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
        expect(res.body.user_id).toBe(userId);

        storyId = res.body.id;
    });

    test("Deve listar stories ativos", async () => {
        const res = await request(app)
            .get("/api/stories");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("status", "active");
    });

    test("Deve marcar story como visto", async () => {
        const res = await request(app)
            .post("/api/stories/view")
            .send({ story_id: storyId, viewer_id: userId });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("viewed", true);
    });

    test("Deve retornar status de visualização", async () => {
        const res = await request(app)
            .get(`/api/stories/user/${userId}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const story = res.body.find(s => s.id === storyId);
        expect(story).toBeDefined();
        expect(story.views.some(v => v.viewer_id === userId)).toBe(true);
    });

    test("Deve simular expiração de story", async () => {
        // Atualiza a story para expirada
        await Story.update({ status: "expired" }, { where: { id: storyId } });

        const res = await request(app).get("/api/stories");
        expect(res.statusCode).toBe(200);
        const expiredStory = res.body.find(s => s.id === storyId);
        expect(expiredStory).toBeUndefined();
    });
});
