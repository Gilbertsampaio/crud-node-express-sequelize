const WebSocket = require("ws");
const ChatController = require("./controllers/chatController");

const wss = new WebSocket.Server({ port: 3000 });

const clients = new Map(); // userId -> ws

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    switch (data.type) {
      case "register":
        clients.set(data.userId, ws);
        break;

      case "message":
        const m = data.payload;
        // salva no banco
        const saved = await ChatController.createMessage(
          m.senderId,
          m.receiverId,
          m.msgType,
          m.content,
          m.metadata
        );

        // envia para quem enviou
        ws.send(JSON.stringify({ type: "message", message: saved }));

        // envia para o destinatário se estiver conectado
        const receiverWs = clients.get(m.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify({ type: "message", message: saved }));
        }
        break;
    }
  });

  ws.on("close", () => console.log("Cliente desconectado"));
});

console.log("WebSocket rodando em ws://localhost:3000");
