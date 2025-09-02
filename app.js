const express = require('express');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', serviceRoutes);

module.exports = app;