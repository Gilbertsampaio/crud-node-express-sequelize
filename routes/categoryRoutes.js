const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Criar categoria
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar uma categoria específica
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
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

// Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Categoria deletada com sucesso' });
    return res.status(404).json({ message: 'Categoria não encontrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
