require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const newRoutes = require('./routes/newsRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const storieRoutes = require('./routes/storieRoutes');
const chatRoutes = require("./routes/chatRoutes");
const messagesRouter = require("./routes/messages");
const uploadRoutes = require("./routes/uploads");
const loginRoutes = require('./routes/loginRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const resetPasswordRoutes = require('./routes/resetPasswordRoutes');

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/news', newRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stories', storieRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messagesRouter);
app.use("/api/uploads", uploadRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/reset-password', resetPasswordRoutes);
app.use('/uploads', express.static('public/uploads'));

module.exports = app;
