const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuração do destino e nome do arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/public/uploads/messages/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

// 🔥 endpoint para upload de mensagens (imagens/docs/etc)
router.post("/message", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  // retorna apenas o nome, para salvar depois em metadata no banco
  res.json({
    fileName: req.file.filename,
    fileSize: formatFileSize(req.file.size)
  });
});

module.exports = router;
