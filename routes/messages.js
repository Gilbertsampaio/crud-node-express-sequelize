const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Message = require("../models/message"); // já importado corretamente

// Buscar histórico entre 2 usuários
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.query;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId, receiver_id: userId },
          { sender_id: userId, receiver_id: currentUserId },
        ],
      },
      order: [["created_at", "ASC"]],
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

// Marcar várias mensagens como lidas
router.post("/read-batch", async (req, res) => {
  const { messageIds = [], readerId } = req.body;

  if (!Array.isArray(messageIds) || !readerId) {
    return res.status(400).json({ error: "bad request" });
  }

  try {
    await Message.update(
      { read_at: new Date() },
      {
        where: {
          id: { [Op.in]: messageIds },
          receiver_id: readerId,
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// 🔥 Novo endpoint: contagem de não lidas por usuário
router.get("/unread-count/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.findAll({
      attributes: ["sender_id", [Message.sequelize.fn("COUNT", "*"), "count"]],
      where: {
        receiver_id: userId,          // <- aqui
        read_at: { [Op.is]: null },   // mensagens ainda não lidas
      },
      group: ["sender_id"],           // agrupa por remetente
    });

    // Resposta: array [{ chatId: <id do remetente>, count: X }]
    const result = messages.map(m => ({
      chatId: m.sender_id,
      count: m.dataValues.count,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar não lidas" });
  }
});

module.exports = router;
