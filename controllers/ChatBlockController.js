const BlockChat = require("../models/chatBlock");
const { Op } = require("sequelize");

const PinController = {
  async blockChat(user_id, chat_id) {
    return await BlockChat.create({ user_id, chat_id });
  },

  async unblockChat(user_id, chat_id) {
    return await BlockChat.destroy({
      where: {
        user_id: user_id,
        chat_id: chat_id
      }
    });
  },

  async getBlockedChats(user_id) {
    return await BlockChat.findAll({
      where: {
        [Op.or]: [
          { user_id: user_id },
        ],
      },
    });
  },

  async isBlocked(user_id, chat_id) {
    const block = await BlockChat.findOne({
      where: {
        user_id: chat_id,
        chat_id: user_id,
      },
    });
    return !!block;
  }
};

module.exports = PinController;
