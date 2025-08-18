const express = require('express');
const app = express();

const authRoutes = require('./features/auth/auth.routes');
const userRoutes = require('./features/users/users.routes'); // <-- Add this line

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // <-- Add this line

module.exports = app;