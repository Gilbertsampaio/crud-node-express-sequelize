const CleanChat = require("../models/chatClean");

const CleanController = {
  async cleanChat(user_id, chat_id) {
    return await CleanChat.create({ user_id, chat_id });
  },

  async uncleanChat(user_id, chat_id) {
    return await CleanChat.destroy({
      where: {
        user_id: user_id,
        chat_id: chat_id
      }
    });
  },

  async getCleanedChats(user_id) {
    return await CleanChat.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { user_id: user_id },
        ],
      },
    });
  },
};

module.exports = CleanController;
