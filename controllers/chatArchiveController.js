const ChatArchive = require("../models/chatArchive");

const ChatArchiveController = {
  async archiveChat(user_id, chat_id) {
    return await ChatArchive.create({ user_id, chat_id });
  },

  async unarchiveChat(user_id, chat_id) {
    return await ChatArchive.destroy({ 
      where: { 
        user_id: user_id, 
        chat_id: chat_id
      } 
    });
  },

  async getArchivedChats(user_id) {
    return await ChatArchive.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { user_id: user_id },
        ],
      },
    });
  },
};

module.exports = ChatArchiveController;
