const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);

module.exports = app;
