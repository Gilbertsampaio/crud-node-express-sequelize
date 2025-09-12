const Like = require('../models/likes');
const User = require("../models/User");

exports.toggle = async (req, res) => {
  try {
    const { table_name, record_id, user_id } = req.body;

    if (!table_name || !record_id || !user_id) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const existing = await Like.findOne({
      where: { table_name, record_id, user_id }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ liked: false });
    } else {
      await Like.create({ table_name, record_id, user_id });
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error("Erro toggleLike:", err);
    return res.status(500).json({ error: "Erro ao processar like" });
  }
};

exports.total = async (req, res) => {
  try {
    const { table_name, record_id } = req.params;

    if (!table_name || !record_id) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const count = await Like.count({
      where: { table_name, record_id }
    });

    return res.json({ total: count });
  } catch (err) {
    console.error("Erro ao contar likes:", err);
    return res.status(500).json({ error: "Erro ao contar likes" });
  }
};

exports.status = async (req, res) => {
  try {
    const { table_name, record_id, user_id } = req.query;

    if (!table_name || !record_id || !user_id) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const total = await Like.count({ where: { table_name, record_id } });
    const liked = !!(await Like.findOne({ where: { table_name, record_id, user_id } }));

    return res.json({ total, liked });
  } catch (err) {
    console.error("Erro ao buscar status de like:", err);
    return res.status(500).json({ error: "Erro ao buscar status de like" });
  }
};

exports.getLikeUsers = async (req, res) => {
  const { table_name, record_id } = req.params;
  try {
    const likes = await Like.findAll({
      where: { table_name, record_id },
      include: [{ model: User, as: "user", attributes: ["name"] }]
    });
    const users = likes.map(like => like.user.name);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários que curtiram" });
  }
};
