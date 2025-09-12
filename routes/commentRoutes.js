// routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentsController");

router.get("/total/:table_name/:record_id", commentController.getTotalComments);
router.get("/:table_name/:record_id", commentController.getCommentsByRecord);
router.post("/", commentController.createComment);
router.delete("/:id", commentController.deleteComment);
module.exports = router;
