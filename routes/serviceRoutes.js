const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const User = require('../models/user');

// Criar serviço
router.post('/services', async (req, res) => {
  try {
    const { userId, title, description } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const service = await Service.create({ userId, title, description });
    res.json(service);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os serviços
router.get('/services', async (req, res) => {
  const services = await Service.findAll({ include: User });
  res.json(services);
});

// Listar serviços de um usuário específico
router.get('/users/:userId/services', async (req, res) => {
  const services = await Service.findAll({
    where: { userId: req.params.userId },
    include: User
  });
  res.json(services);
});

// Listar um serviço específico
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, { include: User });
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar serviço
router.put('/services/:id', async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const [updated] = await Service.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedService = await Service.findByPk(req.params.id, { include: User });
      return res.json(updatedService);
    }
    return res.status(404).json({ message: 'Serviço não encontrado' });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Deletar serviço
router.delete('/services/:id', async (req, res) => {
  try {
    const deleted = await Service.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Serviço deletado com sucesso' });
    return res.status(404).json({ message: 'Serviço não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
