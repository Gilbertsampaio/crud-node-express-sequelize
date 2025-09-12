// controllers/commentController.js
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.getTotalComments = async (req, res) => {
    try {
        const { table_name, record_id } = req.params;
        const total = await Comment.count({
            where: { table_name, record_id },
        });
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar total de comentários" });
    }
};

exports.getCommentsByRecord = async (req, res) => {
    try {
        const { table_name, record_id } = req.params;
        const comments = await Comment.findAll({
            where: { table_name, record_id },
            order: [["created_at", "DESC"]],
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar comentários" });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { table_name, record_id, content, user_id } = req.body;

        if (!table_name || !record_id || !user_id || !content) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const comment = await Comment.create({
            table_name,
            record_id,
            user_id,
            content,
        });

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar comentário" });
    }
};

exports.getCommentsByRecord = async (req, res) => {
    try {
        const { table_name, record_id } = req.params;

        const comments = await Comment.findAll({
            where: { table_name, record_id },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name"]
                }
            ],
            order: [["created_at", "DESC"]],
        });

        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar comentários" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = parseInt(req.query.user_id); // pega do query

        const comment = await Comment.findByPk(id);

        if (!comment) return res.status(404).json({ error: "Comentário não encontrado" });

        if (comment.user_id !== user_id) {
            return res.status(403).json({ error: "Não autorizado" });
        }

        await comment.destroy();
        res.json({ message: "Comentário excluído com sucesso" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao excluir comentário" });
    }
};