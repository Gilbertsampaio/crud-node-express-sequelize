// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");

router.get("/history/:userId", async (req, res) => {
  try {
    const user1 = req.user.id; // supondo que você tenha middleware de auth
    const user2 = parseInt(req.params.userId, 10);

    const messages = await ChatController.getMessages(user1, user2);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

module.exports = router;
