import express, { Router, json } from 'express';
import dotenv from 'dotenv';
import multer from "multer";
import path from "path";
dotenv.config();
const app = express()
import { connect } from 'mongoose';
import pkg from 'body-parser';
const { json: _json } = pkg;
import User, { findOne, findById, findByIdAndUpdate } from './models/user.model.js';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import token from 'jsonwebtoken';
const { sign, verify } = token;
import { uploadOnCloudinary } from './config/cloudinary.js';
import sendEmail from './sendEmail.js';

const router = Router();
app.use(json());
app.use(_json());
app.use(cors({
  origin: ["https://receiptify-backend.vercel.app"],
  methods: ["POST", "GET"],
  credentials: true
}));
app.use('/api/user', authenticateToken);
app.use('/api/upload', authenticateToken);

const SECRET_KEY = process.env.SECRET_KEY;

function generateToken(user) {
    return sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h', 
    });
}

// Email sending



// Multer

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Multer for email sending

const memoryStorage = multer.memoryStorage();
const emailUpload = multer({ storage: memoryStorage });

// Endpoint to trigger email sending
app.post('/send-email', emailUpload.single('receipt'), (req, res) => {
  const { email } = req.body;
  const receiptFile = req.file;

  if (!email) {
    return res.status(400).send('Email address is required');
  }

  if (!receiptFile) {
    return res.status(400).send('Receipt file is required');
  }

  sendEmail(email, receiptFile.buffer)
    .then(() => {
      res.send('Email sent successfully');
    })
    .catch(error => {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send email');
    });
});

// Upload endpoint

app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const localFilePath = req.file.path;
    const result = await uploadOnCloudinary(localFilePath);

    if (result) {
      // Update the user's document with the new receipt URL
      const userId = req.user.id; // Use the user ID from the token
      const user = await User.findById(userId);
      if (user) {
        user.receiptUrls.push(result.url);
        await user.save();
        res.status(200).json({ url: result.url });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(500).json({ error: 'Failed to upload to Cloudinary' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, companyName, companySlogan } = req.body;
        const newUser = new User({ firstName, lastName, email, password, companyName, companySlogan });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Directly compare passwords (not recommended for production)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Send token in response
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token' });
      req.user = user;
      next();
  });
}

// Example protected route
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
      const user = await findById(req.user.id, 'firstName lastName email password companyName companySlogan'); // Specify the fields you want to retrieve
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Fetch receipt history

app.get('/api/user/receipts', authenticateToken, async (req, res) => {
  try {
    // Use the user ID from the token
    const user = await User.findById(req.user.id); // Ensure you use req.user.id or req.user._id depending on the token payload
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ receiptUrls: user.receiptUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Fetch user details
router.get('/api/user', authenticateToken, async (req, res) => {
    try {
        // Use the user ID from the token
        const user = await findById(req.user.id); // Ensure you use req.user.id or req.user._id depending on the token payload
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user details
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
      const { firstName, lastName, email, password, companyName, companySlogan } = req.body;

      const updatedUser = await findByIdAndUpdate(
          req.user.id, // Use req.user.id from the token payload
          { firstName, lastName, email, password, companyName, companySlogan },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.get('/create-user', async (req, res) => {
    try {
      const newUser = new User({
        firstName: 'Abdul',
        secondName: 'Wahab',
        email: 'abdulwahab5547@gmail.com',
        password: '545454',
        companyName: 'Abdulify',
        companySlogan: 'Abduls and Abduls',
      });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});


// Example route to create a new user
router.post('/signup', async (req, res) => {
    try {
      const { username, password, companyName, slogan } = req.body;
      const newUser = new User({ username, password, companyName, slogan });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

const uri = process.env.MONGODB_URL;

app.get('/', (req, res) => {
  res.send('Hello something!')
})

app.get('/something', (req, res) => {
    res.send('Hello something something something!')
  })

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})

app.use('/api', router);

// Connecting to database

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

export default router;
