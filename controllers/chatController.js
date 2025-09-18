const Message = require("../models/message");

const ChatController = {
  // criar mensagem
  async createMessage(sender_id, receiver_id, type, content, metadata = {}) {
    return await Message.create({ sender_id, receiver_id, type, content, metadata });
  },

  // pegar histórico entre dois usuários
  async getMessages(user1, user2) {
    return await Message.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { sender_id: user1, receiver_id: user2 },
          { sender_id: user2, receiver_id: user1 },
        ],
      },
      order: [["created_at", "ASC"]],
    });
  },
};

module.exports = ChatController;
