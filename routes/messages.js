const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Message = require("../models/message");
const CleanChat = require("../models/chatClean");

// Buscar histórico entre 2 usuários
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   const { currentUserId } = req.query;

//   try {
//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { sender_id: currentUserId, receiver_id: userId },
//           { sender_id: userId, receiver_id: currentUserId },
//         ],
//       },
//       order: [["created_at", "ASC"]],
//     });
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erro ao buscar mensagens" });
//   }
// });

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.query;

  try {
    const cleanChatRecord = await CleanChat.findOne({
      where: {
        user_id: currentUserId,
        chat_id: userId,
      },
    });

    const cleanedAt = cleanChatRecord ? cleanChatRecord.cleaned_at : null;

    const whereCondition = {
      [Op.or]: [
        { sender_id: currentUserId, receiver_id: userId },
        { sender_id: userId, receiver_id: currentUserId },
      ],
    };

    if (cleanedAt) {
      whereCondition.created_at = {
        [Op.gt]: cleanedAt,
      };
    }

    const messages = await Message.findAll({
      where: whereCondition,
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

// Buscar uma mensagem enquete específica pelo ID
router.get("/msg/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar mensagem" });
  }
});

// Buscar uma mensagem evento específica pelo ID
router.get("/evento/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
});

router.put("/evento/:id/participantes", async (req, res) => {
  const { id } = req.params;
  const { participante } = req.body;

  if (!participante || !participante.id) {
    return res.status(400).json({ error: "Participante inválido" });
  }

  try {
    const message = await Message.findByPk(id);

    if (!message || message.type !== "evento") {
      return res.status(404).json({ error: "Evento não encontrado ou tipo inválido" });
    }

    const metadata = message.metadata || {};
    const participantes = Array.isArray(metadata.participantes) ? [...metadata.participantes] : [];

    const index = participantes.findIndex(p => p.id === participante.id);

    if (index !== -1) {
      participantes[index] = {
        ...participantes[index],
        ...participante,
      };
    } else {
      participantes.push(participante);
    }

    metadata.participantes = participantes;

    // 👇 Força o Sequelize a detectar a alteração no JSON
    message.set("metadata", metadata);
    message.changed("metadata", true);
    await message.save();

    res.json({ success: true, metadata: message.metadata });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar participantes" });
  }
});

// Buscar uma mensagem enquete específica pelo ID
router.get("/enquete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: "Enquete não encontrada" });
    }

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar enquete" });
  }
});

module.exports = router;
