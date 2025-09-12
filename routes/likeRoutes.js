// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController');

router.post('/toggle', likesController.toggle);
router.get('/total/:table_name/:record_id', likesController.total);
router.get('/status', likesController.status);
router.get('/users/:table_name/:record_id', likesController.getLikeUsers);

module.exports = router;
