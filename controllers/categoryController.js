// controllers/categoryController.js
const { Category, Service } = require('../models/index');

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se existe algum serviço vinculado a essa categoria
    const servicesCount = await Service.count({ where: { categoryId: id } });

    if (servicesCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir a categoria, pois está associada a um ou mais serviços.'
      });
    }

    const deleted = await Category.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.json({ message: 'Categoria excluída com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao excluir categoria.' });
  }
};
