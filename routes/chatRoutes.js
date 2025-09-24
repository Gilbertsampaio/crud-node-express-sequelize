// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const ChatArchiveController = require("../controllers/chatArchiveController");
const ChatPinnedController = require("../controllers/ChatPinnedController");
const ChatBlockController = require("../controllers/ChatBlockController");
const ChatCleanController = require("../controllers/ChatCleanedController");
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

//CHATS ARQUIVADOS

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

//CHATS FIXADOS

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

//CHATS BLOQUEADOS

// Bloquear chat
router.post("/:chatId/blockChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    const block = await ChatBlockController.blockChat(userId, chatId);
    res.json({ success: true, block });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao bloquear chat" });
  }
});

// Desbloquear chat
router.delete("/:chatId/unblockChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    await ChatBlockController.unblockChat(userId, chatId);
    res.json({ success: true, message: "Chat desbloqueados" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao desbloquear chat" });
  }
});

// Listar chats bloqueados do usuário logado
router.get("/blocked", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const blokeds = await ChatBlockController.getBlockedChats(userId);
    res.json(blokeds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar chats bloqueados" });
  }
});

// verifica se o usuario esta bloqueado
router.get("/isBlocked/:chatId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    const blocked = await ChatBlockController.isBlocked(userId, chatId);
    res.json({ blocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao verificar usuario bloqueado" });
  }
});

//CHATS LIMPOS

// Limpar chat
router.post("/:chatId/cleanChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    const clean = await ChatCleanController.cleanChat(userId, chatId);
    res.json({ success: true, clean });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao limpar chat" });
  }
});

// Deslimpar chat
router.delete("/:chatId/uncleanChat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = parseInt(req.params.chatId, 10);

    await ChatCleanController.uncleanChat(userId, chatId);
    res.json({ success: true, message: "Chat deslimpos" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deslimpar chat" });
  }
});

// Listar chats limpos do usuário logado
router.get("/cleaned", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const cleaneds = await ChatCleanController.getCleanedChats(userId);
    res.json(cleaneds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar chats limpos" });
  }
});


module.exports = router;
