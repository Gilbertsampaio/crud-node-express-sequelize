const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt'); // Para hash de senha

// --- Criar usuário ---
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Definir senha padrão e gerar hash
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

// --- Atualizar usuário ---
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updatedData = { name, email };

    // Se enviar senha, gerar hash antes de atualizar
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
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
