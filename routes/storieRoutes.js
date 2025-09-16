const express = require("express");
const router = express.Router();
const storieController = require("../controllers/storieController");
const authMiddleware = require('../authMiddleware/authMiddleware');
const multer = require("multer");
const path = require('path');

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

// CRUD de stories
router.post("/", authMiddleware, upload.single("media"), storieController.createStory);
router.get("/", authMiddleware, storieController.listActiveStories);
router.get("/:id", authMiddleware, storieController.getStoryById);
router.post("/view", authMiddleware, storieController.markAsViewed);
router.get("/user/:user_id", authMiddleware, storieController.getStoriesByUser);
router.put("/:id", authMiddleware, upload.single("media"), storieController.updateStory);
router.delete("/:id", authMiddleware, storieController.deleteStory);

module.exports = router;
