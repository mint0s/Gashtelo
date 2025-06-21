const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/Users.js');


const JWT_SECRET = 'your_secret_key_here'; // change to a secure secret in production

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
  featured: Boolean,  // ✅ New field
  type: String    // ✅ New field\
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

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, userType } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed, userType });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, userType: user.userType }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { name: user.name, email: user.email, userType: user.userType } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

