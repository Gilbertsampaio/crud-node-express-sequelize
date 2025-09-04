const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const User = require('../models/user');
const Category = require('../models/category'); 
// const authMiddleware = require('../authMiddleware/authMiddleware');

// Criar serviço
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, categoryId } = req.body; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const service = await Service.create({ userId, title, description, categoryId });
    res.json(service);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({ include: [User, Category] });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// listar apenas meus serviços
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const services = await Service.findAll({
      where: { userId }
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar serviços." });
  }
});

// Listar serviços de um usuário específico
router.get('/:userId/services', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { userId: req.params.userId },
      include: [User, Category]
    });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar um serviço específico
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, { include: [User, Category] }); // <-- incluir Category
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { userId, categoryId } = req.body;

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const [updated] = await Service.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedService = await Service.findByPk(req.params.id, { include: [User, Category] });
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
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Service.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Serviço deletado com sucesso' });
    return res.status(404).json({ message: 'Serviço não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
