const app = require('./app');
const sequelize = require('./config/database');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Inicializa o servidor HTTP do Express
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Inicializa o WebSocket server usando o mesmo servidor HTTP
const wss = new WebSocket.Server({ server });

// Mapa de usuários conectados { userId: ws }
const connectedUsers = new Map();

// Função auxiliar para broadcast
function broadcast(data, excludeWs = null) {
  const msg = JSON.stringify(data);
  for (let client of connectedUsers.values()) {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'register': {
          const { userId } = data;

          if (!userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'userId é obrigatório para registrar' }));
            return;
          }

          // Se já havia um socket antigo desse usuário, fecha
          if (connectedUsers.has(userId)) {
            const oldWs = connectedUsers.get(userId);
            if (oldWs.readyState === WebSocket.OPEN) {
              oldWs.close();
            }
          }

          connectedUsers.set(userId, ws);
          console.log(`Usuário registrado: ${userId}`);

          // Notifica todos que esse usuário está online
          broadcast({
            type: 'status',
            userId,
            is_online: true
          }, ws);
          break;
        }

        case 'message':
          {
            const { senderId, receiverId, content, msgType = 'text', metadata = {} } = data.payload || {};

            if (!senderId || !receiverId || !content) {
              ws.send(JSON.stringify({ type: 'error', message: 'Mensagem inválida' }));
              return;
            }

            const Message = require('./models/message');
            const savedMessage = await Message.create({
              sender_id: senderId,
              receiver_id: receiverId,
              type: msgType,
              content,
              metadata
            });

            // Envia para o destinatário se estiver online
            const receiverWs = connectedUsers.get(receiverId);
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
              receiverWs.send(JSON.stringify({ type: 'message', message: savedMessage }));
            }

            // Confirma para o remetente
            ws.send(JSON.stringify({ type: 'message', message: savedMessage }));
            break;
          }

        case 'typing':
          {
            const { senderId: sId, receiverId: rId, isTyping } = data.payload;
            const receiverSocket = connectedUsers.get(rId);
            if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
              receiverSocket.send(JSON.stringify({
                type: 'typing',
                payload: { senderId: sId, receiverId: rId, isTyping }
              }));
            }
          }
          break;

        case 'read':
          {
            const { chatId, userId, messageIds } = data.payload;
            if (!Array.isArray(messageIds) || messageIds.length === 0) break;

            const Message = require('./models/message');

            try {
              // Marca mensagens como lidas (somente para o receiver)
              await Message.update(
                { read_at: new Date() },
                { where: { id: messageIds, receiver_id: userId } }
              );

              // Busca mensagens atualizadas
              const updated = await Message.findAll({ where: { id: messageIds } });

              // Notifica cada remetente sobre a leitura
              for (const msg of updated) {
                const senderWs = connectedUsers.get(msg.sender_id);

                // CORREÇÃO: chatId correto para o remetente é o id do usuário que recebeu a leitura
                const chatIdForSender = msg.receiver_id; // o front usa esse id para encontrar o chat

                const payload = {
                  type: 'read',
                  payload: {
                    chatId: chatIdForSender,       // id do chat que o remetente vê
                    messageIds: [msg.id],          // agora é array
                    read_at: msg.read_at || new Date().toISOString()
                  }
                };

                if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                  senderWs.send(JSON.stringify(payload));
                }
              }

              // Opcional: confirma para quem marcou como lido
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'read-ack', payload: { chatId, messageIds } }));
              }
            } catch (err) {
              console.error('[WS read] erro:', err);
            }
          }
          break;

        case 'blocked': {
          const { chatId, blockedValue, userId } = data.payload;
          // 🔹 userId = quem fez a ação de bloquear/desbloquear
          // 🔹 chatId = alvo do bloqueio

          const receiverSocket = connectedUsers.get(chatId);

          // 🔹 Informa ao usuário que foi bloqueado/desbloqueado
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(JSON.stringify({
              type: "blocked",
              payload: { chatId: userId, blocked: blockedValue }
            }));
          }

          // 🔹 Também informa ao usuário que fez a ação (para atualizar UI local)
          // ws.send(JSON.stringify({
          //   type: "blocked",
          //   payload: { chatId, blocked: blockedValue }
          // }));
        }
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Tipo de evento não reconhecido' }));
      }
    } catch (err) {
      console.error('Erro ao processar mensagem WS:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Erro interno no servidor' }));
    }
  });

  ws.on('close', () => {
    for (let [userId, socket] of connectedUsers.entries()) {
      if (socket === ws) {
        connectedUsers.delete(userId);
        broadcast({ type: 'status', userId, is_online: false });
        break;
      }
    }
  });
});

// Sincroniza o banco
sequelize.sync()
  .then(() => console.log(`[${process.env.NODE_ENV?.toUpperCase() || 'DEV'}] DB conectado e sincronizado: ${process.env.DB_NAME}`))
  .catch(err => console.error('Erro ao conectar com o banco:', err));