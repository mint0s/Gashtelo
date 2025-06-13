const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/gashtelo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Schema
const Property = mongoose.model('Property', {
  title: String,
  location: String,
  price: Number,
  guests: Number,
  description: String,
  images: [String],   // all uploaded images
  image: String       // selected cover image
});

// Routes
app.post('/api/properties', async (req, res) => {
  try {
    const newProp = new Property(req.body);
    await newProp.save();
    res.send({ success: true });
  } catch (err) {
    console.error('❌ Failed to save property:', err); // Add this
    res.status(500).send({ success: false, error: err.message }); // Add error response
  }
});

app.get('/api/properties', async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gashtelo server running at http://localhost:${PORT}`);
});
