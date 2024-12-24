const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Simple route
app.get('/', (req, res) => {
  res.send('Hello World from Azure App Service!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
