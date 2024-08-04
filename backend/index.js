import express, { Router, json } from 'express';
import dotenv from 'dotenv';
import multer from "multer";
import path from "path";
dotenv.config();
import { connect } from 'mongoose';
import User, { findOne, findById, findByIdAndUpdate } from './models/user.model.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import token from 'jsonwebtoken';
import { uploadOnCloudinary } from './config/cloudinary.js';
import sendEmail from './sendEmail.js';

const app = express();
const router = Router();
const { sign, verify } = token;

// Middleware
app.use(json());
app.use(cors({
  origin: ["https://abdulwahab5547.github.io/receiptify-app-frontend/"],
  methods: ["POST", "GET"],
  credentials: true
}));

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token' });
      req.user = user;
      next();
  });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const memoryStorage = multer.memoryStorage();
const emailUpload = multer({ storage: memoryStorage });

// Routes
router.post('/send-email', emailUpload.single('receipt'), async (req, res) => {
  const { email } = req.body;
  const receiptFile = req.file;

  if (!email || !receiptFile) {
    return res.status(400).send('Email address and receipt file are required');
  }

  try {
    await sendEmail(email, receiptFile.buffer);
    res.send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const result = await uploadOnCloudinary(req.file.path);
    if (!result) throw new Error('Failed to upload to Cloudinary');
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.receiptUrls.push(result.url);
    await user.save();
    res.status(200).json({ url: result.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, companyName, companySlogan } = req.body;
  try {
    const newUser = new User({ firstName, lastName, email, password, companyName, companySlogan });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findOne({ email });
    if (!user || password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch user details
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await findById(req.user.id, 'firstName lastName email password companyName companySlogan');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/receipts', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ receiptUrls: user.receiptUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Example routes
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/something', (req, res) => res.send('Hello something something!'));

// Final middleware: mount the router
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and start server
const uri = process.env.MONGODB_URL;
connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
