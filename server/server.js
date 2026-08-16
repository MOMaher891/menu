const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { protect } = require('./middleware/auth');
const upload = require('./middleware/upload');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API Mounts
app.use('/api/admin/auth', require('./routes/authRoutes'));
app.use('/api/admin/categories', require('./routes/categoryRoutes'));
app.use('/api/admin/items', require('./routes/itemRoutes'));
app.use('/api/admin/offers', require('./routes/offerRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/admin/settings', require('./routes/settingRoutes'));

// Upload File Endpoint (Admin Protected)
app.post('/api/upload', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    
    // Return relative URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
