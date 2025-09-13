const express = require('express');
const router = express.Router();
const { Service, Category } = require('../models/index');
const authMiddleware = require('../authMiddleware/authMiddleware');

// Criar categoria
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.json(category);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Listar todas as categorias
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar uma categoria específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar categoria
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const [updated] = await Category.update({ name, description }, { where: { id: req.params.id } });
    if (updated) {
      const updatedCategory = await Category.findByPk(req.params.id);
      return res.json(updatedCategory);
    }
    return res.status(404).json({ message: 'Categoria não encontrada' });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Deletar categoria (com checagem de serviços vinculados)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se há serviços vinculados a esta categoria
    const servicesCount = await Service.count({ where: { categoryId: id } });
    if (servicesCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir a categoria, pois está associada a um ou mais serviços.'
      });
    }

    const deleted = await Category.destroy({ where: { id } });
    if (deleted) return res.json({ message: 'Categoria deletada com sucesso' });

    return res.status(404).json({ message: 'Categoria não encontrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
