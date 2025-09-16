const { Storie, StorieView, User } = require("../models/index");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { Sequelize } = require('sequelize');

// Criar uma story
exports.createStory = async (req, res) => {
  try {
    // Agora req.body terá os campos do FormData e req.file terá o arquivo
    const { user_id, type, title } = req.body;
    const file = req.file;

    if (!user_id || !file) {
      return res.status(400).json({ message: "Campos obrigatórios faltando" });
    }

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    if (type && !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Tipo inválido. Use image ou video" });
    }

    const story = await Storie.create({
      user_id,
      media_url: file.filename, // ou file.path se quiser o caminho completo
      type: type || "image",
      title: title || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.listActiveStories = async (req, res) => {
  try {
    const viewerId = req.user.id;

    const stories = await Storie.findAll({
      where: {
        status: "active",
        expires_at: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "image"],
        },
      ],
      attributes: {
        include: [
          // retorna `viewed: true/false`
          [
            Sequelize.literal(`EXISTS(
              SELECT 1 FROM story_views sv 
              WHERE sv.story_id = Storie.id AND sv.viewer_id = ${viewerId}
            )`),
            "viewed",
          ],
        ],
      },
      order: [["created_at", "DESC"]],
    });

    res.json(stories);
  } catch (err) {
    console.error("Erro ao listar stories:", err);
    res.status(500).json({ error: err.message });
  }
};

// Listar um story específico
exports.getStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Storie.findOne({
      where: {
        id,
        status: "active",
        expires_at: { [Op.gt]: new Date() },
      },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "image"] },
      ],
    });

    if (!story) {
      return res.status(404).json({ error: "Story não encontrado ou expirado" });
    }

    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marcar story como visto
exports.markAsViewed = async (req, res) => {
  try {
    const viewer_id = req.user.id;
    const { story_id } = req.body;

    if (!story_id) {
      return res.status(400).json({ message: "story_id é obrigatório" });
    }

    const [view, created] = await StorieView.findOrCreate({
      where: { story_id, viewer_id },
      defaults: { viewed_at: new Date() },
    });

    if (!created) {
      await view.update({ viewed_at: new Date() });
    }

    res.json({ viewed: true, alreadyViewed: !created });
  } catch (err) {
    console.error("Erro ao marcar story como visto:", err);
    res.status(500).json({ error: "Erro ao marcar story como visto" });
  }
};

// Consultar stories de um usuário
exports.getStoriesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const stories = await Storie.findAll({
      where: {
        user_id,
        status: "active",
        expires_at: { [Op.gt]: new Date() },
      },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "image"] },
        { model: StorieView, as: "views", attributes: ["viewer_id"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar uma story
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, status, removeMedia } = req.body;
    const file = req.file;

    const story = await Storie.findByPk(id);
    if (!story) {
      return res.status(404).json({ message: "Storie não encontrada" });
    }

    if (type && !["image", "video"].includes(type)) {
      return res.status(400).json({ message: "Tipo inválido. Use image ou video" });
    }

    // Remover mídia existente se solicitado
    if (removeMedia === "true" && story.media_url) {
      const filePath = path.join(__dirname, "..", "frontend/public/uploads/stories", story.media_url);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => { if (err) console.error(err); });
      }
      story.media_url = null;
    }

    // Substituir mídia se nova foi enviada
    if (file) {
      if (story.media_url) {
        const oldFilePath = path.join(__dirname, "..", "frontend/public/uploads/stories", story.media_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (err) => { if (err) console.error(err); });
        }
      }
      story.media_url = file.filename;
    }

    // Atualizar os demais campos
    story.title = title || story.title;
    story.type = type || story.type;
    story.status = status || story.status;

    await story.save();
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Excluir uma story
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Storie.findByPk(id);
    if (!story) {
      return res.status(404).json({ message: "Storie não encontrada" });
    }

    // Excluir mídia associada no disco também
    if (story.media_url) {
      const filePath = path.join(__dirname, "..", "frontend/public/uploads/stories", story.media_url);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => { if (err) console.error(err); });
      }
    }

    await story.destroy();
    res.json({ message: "Storie excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};