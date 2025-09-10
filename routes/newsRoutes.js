const express = require('express');
const router = express.Router();
const News = require('../models/news');
const User = require('../models/user');
const Category = require('../models/category'); 
const authMiddleware = require('../authMiddleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer (mesma usada em usuários)
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

// --- Criar novidade (com upload de imagem) ---
router.post('/', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const { userId, title, description, categoryId, externalUrl } = req.body;

    if (!userId || !title || !description || !categoryId) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });

    const newNews = {
      userId,
      title,
      description,
      categoryId,
      externalUrl
    };

    if (req.file) {
      newNews.image = req.file.filename;
    }

    const news = await News.create(newNews);
    res.json(news);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Listar todas as novidades
router.get('/', authMiddleware, async (req, res) => {
  try {
    const newsList = await News.findAll({ include: [User, Category] });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar apenas minhas novidades
router.get('/my/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const newsList = await News.findAll({
      where: { userId },
      include: [Category]
    });
    res.json(newsList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar novidades." });
  }
});

// Listar novidade específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const newsItem = await News.findByPk(req.params.id, { include: [User, Category] });
    if (!newsItem) return res.status(404).json({ message: 'Novidade não encontrada' });
    res.json(newsItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Atualizar novidade (com upload de imagem) ---
router.put('/:id', upload.single('image'), authMiddleware, async (req, res) => {
  try {
    const { userId, categoryId, title, description, externalUrl, removeImage } = req.body;

    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ message: 'Novidade não encontrada' });

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const updatedData = { title, description, categoryId, userId, externalUrl };

    // Remove a imagem existente se solicitado
    if (removeImage === 'true' && news.image) {
      const filePath = path.join(__dirname, '..', 'frontend/public/uploads', news.image);
      fs.unlink(filePath, (err) => { if (err) console.error(err); });
      updatedData.image = null;
    }

    // Substitui por nova imagem se enviada
    if (req.file) {
      if (news.image) {
        const oldFilePath = path.join(__dirname, '..', 'frontend/public/uploads', news.image);
        fs.unlink(oldFilePath, (err) => { if (err) console.error(err); });
      }
      updatedData.image = req.file.filename;
    }

    await news.update(updatedData);
    res.json(news);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Deletar novidade
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await News.destroy({ where: { id: req.params.id } });
    if (deleted) return res.json({ message: 'Novidade deletada com sucesso' });
    return res.status(404).json({ message: 'Novidade não encontrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;