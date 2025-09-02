const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Criar usuário
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar todos
router.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Atualizar
router.put('/users/:id', async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Usuário atualizado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar
router.delete('/users/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Usuário deletado' });
});

module.exports = router;