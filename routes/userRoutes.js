const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const authMiddleware = require('../authMiddleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// --- Criar usuário (com upload de imagem) ---
router.post('/', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUserData = {
      name,
      email,
      password: hashedPassword,
    };

    if (req.file) {
      newUserData.image = req.file.filename; // salva o nome do arquivo
    }

    const user = await User.create(newUserData);
    res.json(user);
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Listar todos ---
router.get('/', authMiddleware, async (req, res) => {
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
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Atualizar usuário (com upload de imagem) ---
router.put('/:id', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const { name, email, password, removeImage } = req.body;
    const updatedData = { name, email };

    // Atualiza a senha se fornecida
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Busca o usuário atual
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Remove a imagem antiga se solicitado
    if (removeImage === 'true' && user.image) {
      const filePath = path.join(__dirname, '..', 'frontend/public/uploads', user.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erro ao remover arquivo:', err);
      });
      updatedData.image = null; // remove do banco
    }

    // Substitui imagem existente se foi enviado novo arquivo
    if (req.file) {
      if (user.image) {
        const oldFilePath = path.join(__dirname, '..', 'frontend/public/uploads', user.image);
        fs.unlink(oldFilePath, (err) => { if (err) console.error(err); });
      }
      updatedData.image = req.file.filename;
    }

    // Atualiza o usuário
    await User.update(updatedData, { where: { id: req.params.id } });
    const updatedUser = await User.findByPk(req.params.id);
    return res.json(updatedUser);

  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Deletar usuário ---
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Usuário deletado com sucesso' });
    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
