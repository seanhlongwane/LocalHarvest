
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Store SSE subscribers
const subscribers = {};

// Sample data (replace with a database later)
let products = [
  { id: 1, name: 'Apple', price: 1.5, quantity: 100 },
  { id: 2, name: 'Banana', price: 0.5, quantity: 200 },
];

// GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// SSE endpoint for real-time updates
app.get('/api/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendUpdate = () => {
    res.write(`data: ${JSON.stringify(products)}\n\n`);
  };

  // Send initial data
  sendUpdate();

  // Add this client to subscribers
  const clientId = Date.now();
  subscribers[clientId] = sendUpdate;

  // Remove client on connection close
  req.on('close', () => {
    delete subscribers[clientId];
  });
});

// POST a new product
app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  newProduct.id = products.length + 1;
  products.push(newProduct);
  
  // Notify all subscribers
  Object.values(subscribers).forEach(sendUpdate => sendUpdate());
  
  res.status(201).json(newProduct);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
