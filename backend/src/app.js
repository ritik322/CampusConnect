const express = require('express');
const app = express();

const authRoutes = require('./features/auth/auth.routes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend!');
});

app.use('/api/auth', authRoutes);

module.exports = app;