const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
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
  images: [String],
  image: String,
  featured: Boolean  // ✅ New field
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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Gashtelo server running at http://localhost:${PORT}`);
});
