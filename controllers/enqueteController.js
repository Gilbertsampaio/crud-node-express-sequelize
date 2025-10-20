const { Enquete, User, Message } = require('../models/index');

exports.toggle = async (req, res) => {
    try {
        const { resposta_index, mensagem_id, user_id, multiplos } = req.body;

        if (!resposta_index || !mensagem_id || !user_id || typeof multiplos === 'undefined') {
            return res.status(400).json({ error: "Parâmetros inválidos ou incompletos" });
        }

        const existing = await Enquete.findOne({
            where: { resposta_index, mensagem_id, user_id }
        });

        if (existing) {
            await existing.destroy();
            return res.json({ voto: false });
        }

        if (multiplos === false) {

            await Enquete.destroy({
                where: {
                    mensagem_id: mensagem_id,
                    user_id: user_id
                }
            });
        }

        await Enquete.create({ resposta_index, mensagem_id, user_id });
        return res.json({ voto: true });

    } catch (err) {
        console.error("Erro toggleEnquete:", err);
        return res.status(500).json({ error: "Erro ao processar voto" });
    }
};

exports.total = async (req, res) => {
    try {
        const { resposta_index, mensagem_id } = req.params;

        if (!resposta_index || !mensagem_id) {
            return res.status(400).json({ error: "Parâmetros inválidos" });
        }

        const count = await Enquete.count({
            where: { resposta_index, mensagem_id }
        });

        return res.json({ total: count });
    } catch (err) {
        console.error("Erro ao contar votos:", err);
        return res.status(500).json({ error: "Erro ao contar votos" });
    }
};

exports.totalGeral = async (req, res) => {
    try {
        const { mensagem_id } = req.params;

        if (!mensagem_id) {
            return res.status(400).json({ error: "Parâmetros inválidos" });
        }

        const count = await Enquete.count({
            where: { mensagem_id }
        });

        return res.json({ total: count });
    } catch (err) {
        console.error("Erro ao contar total de votos:", err);
        return res.status(500).json({ error: "Erro ao contar total de votos" });
    }
};

exports.status = async (req, res) => {
    try {
        const { resposta_index, mensagem_id, user_id } = req.query;

        if (!resposta_index || !mensagem_id || !user_id) {
            return res.status(400).json({ error: "Parâmetros inválidos" });
        }

        const total = await Enquete.count({ where: { resposta_index, mensagem_id } });
        const voto = !!(await Enquete.findOne({ where: { resposta_index, mensagem_id, user_id } }));

        return res.json({ total, voto });
    } catch (err) {
        console.error("Erro ao buscar status de voto:", err);
        return res.status(500).json({ error: "Erro ao buscar status de voto" });
    }
};

exports.getVotosUsers = async (req, res) => {
    const { resposta_index, mensagem_id } = req.params;
    try {
        const votos = await Enquete.findAll({
            where: { resposta_index, mensagem_id },
            include: [{ model: User, as: "user", attributes: ["name"] }]
        });
        const users = votos.map(like => like.user.name);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar usuários que votaram" });
    }
};

exports.getVotosEnquete = async (req, res) => {
    try {
        const { mensagem_id } = req.params;

        if (!mensagem_id) {
            return res.status(400).json({ error: "Parâmetros inválidos" });
        }

        const votos = await Enquete.findAll({
            where: { mensagem_id },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "image"],
                },
                {
                    model: Message,
                    as: "mensagem",
                    attributes: ["content", "metadata", "created_at"],
                },
            ],
        });

        // Se não houver votos, retorna um response vazio mas consistente
        if (!votos.length) {
            return res.json({
                enquete: null,
                votos: [],
            });
        }

        // Mapeia votos individualmente
        const votosEnquete = votos.map(voto => ({
            id: voto.id,
            resposta_index: voto.resposta_index,
            mensagem_id: voto.mensagem_id,
            user_id: voto.user_id,
            user_name: voto.user?.name || null,
            user_image: voto.user?.image || null,
            createdAt: voto.data_voto || voto.createdAt,
        }));

        // Pega os dados da mensagem
        const mensagem = votos[0].mensagem ? {
            content: votos[0].mensagem.content,
            metadata: votos[0].mensagem.metadata,
            created_at: votos[0].mensagem.created_at,
        } : null;

        // Atualiza cada resposta com total e os votos correspondentes
        if (mensagem && mensagem.metadata && Array.isArray(mensagem.metadata.respostas)) {
            mensagem.metadata.respostas = mensagem.metadata.respostas.map(r => {
                const votosDaResposta = votosEnquete.filter(v => v.resposta_index === r.index);
                return {
                    ...r,
                    totalVotos: votosDaResposta.length,
                    votos: votosDaResposta, // adiciona os detalhes dos votos
                };
            });
        }

        // Monta resposta final
        const response = {
            enquete: mensagem,
        };

        res.json(response);
    } catch (err) {
        console.error("Erro ao buscar votos da enquete:", err);
        return res.status(500).json({ error: "Erro ao buscar votos da enquete" });
    }
};