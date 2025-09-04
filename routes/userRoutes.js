const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const authMiddleware = require('../authMiddleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- Criar usuário ---
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;

    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({ name, email, password: hashedPassword });
    res.json(user);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Listar todos ---
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Dados do usuário ---
router.get('/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// --- Listar usuário pelo id ---
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Atualizar usuário (com upload de imagem) ---
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updatedData = { name, email };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updatedData.image = req.file.filename; // salva apenas o nome do arquivo
    }

    const [updated] = await User.update(updatedData, { where: { id: req.params.id } });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      return res.json(updatedUser);
    }

    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Deletar usuário ---
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Usuário deletado com sucesso' });
    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
