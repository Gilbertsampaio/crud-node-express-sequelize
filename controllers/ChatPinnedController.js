const PinnedChat = require("../models/chatPinned");

const PinController = {
  async pinChat(user_id, chat_id) {
    return await PinnedChat.create({ user_id, chat_id });
  },

  async unpinChat(user_id, chat_id) {
    return await PinnedChat.destroy({
      where: {
        user_id: user_id,
        chat_id: chat_id
      }
    });
  },

  async getPinnedChats(user_id) {
    return await PinnedChat.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { user_id: user_id },
        ],
      },
    });
  },
};

module.exports = PinController;
