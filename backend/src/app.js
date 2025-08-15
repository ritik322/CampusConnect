const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend!');
});

module.exports = app;