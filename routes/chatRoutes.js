// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const ChatArchiveController = require("../controllers/chatArchiveController");
const ChatPinnedController = require("../controllers/ChatPinnedController");
const authMiddleware = require('../authMiddleware/authMiddleware');

router.get("/history/:userId", authMiddleware, async (req, res) => {
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

// Arquivar chat
router.post("/:chatId/archive", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    const archive = await ChatArchiveController.archiveChat(userId, chatId);
    res.json({ success: true, archive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao arquivar chat" });
  }
});

// Desarquivar chat
router.delete("/:chatId/unarchive", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    await ChatArchiveController.unarchiveChat(userId, chatId);
    res.json({ success: true, message: "Chat desarquivado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao desarquivar chat" });
  }
});

// Listar chats arquivados do usuário logado
router.get("/archived", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const archives = await ChatArchiveController.getArchivedChats(userId);
    res.json(archives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar chats arquivados" });
  }
});

// Fixar chat
router.post("/:chatId/pinChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    const fixe = await ChatPinnedController.pinChat(userId, chatId);
    res.json({ success: true, fixe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fixar chat" });
  }
});

// Desafixar chat
router.delete("/:chatId/unpinChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    await ChatPinnedController.unpinChat(userId, chatId);
    res.json({ success: true, message: "Chat desafixados" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao desafixar chat" });
  }
});

// Listar chats fixados do usuário logado
router.get("/fixed", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const fixeds = await ChatPinnedController.getPinnedChats(userId);
    res.json(fixeds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar chats fixados" });
  }
});


module.exports = router;
