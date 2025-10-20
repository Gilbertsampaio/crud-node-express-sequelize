// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const enqueteController = require('../controllers/enqueteController');

router.post('/toggle', enqueteController.toggle);
router.get('/total/:resposta_index/:mensagem_id', enqueteController.total);
router.get('/totalGeral/:mensagem_id', enqueteController.totalGeral);
router.get('/status', enqueteController.status);
router.get('/users/:resposta_index/:mensagem_id', enqueteController.getVotosUsers);
router.get('/votos/:mensagem_id', enqueteController.getVotosEnquete);

module.exports = router;
