import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

// Helper to create JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, roleId: user.roleId },
    process.env.JWT_SECRET || 'your-default-secret-key',
    { expiresIn: '30d' }
  );
};

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'User routes are working' });
});

// Get all users (admin only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.roleId !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view user list' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);

    const { username, email, password, institutionId, roleId } = req.body;

    // Validate required fields
    if (!username || !email || !password || !institutionId || !roleId) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['username', 'email', 'password', 'institutionId', 'roleId'],
        received: Object.keys(req.body)
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate role
    const validRoles = ['admin', 'physicalStaff', 'financialStaff', 'registrar'];
    if (!validRoles.includes(roleId)) {
      return res.status(400).json({
        message: 'Invalid role',
        validRoles,
        received: roleId
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      institutionId,
      roleId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        institutionId: user.institutionId,
        roleId: user.roleId
      });
    }
  } catch (error) {
    res.status(400).json({
      message: 'Invalid user data',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Quick check: ensure MongoDB connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected (readyState=' + mongoose.connection.readyState + ')');
      return res.status(500).json({ message: 'Database connection not ready', readyState: mongoose.connection.readyState });
    }

    // Find user by email
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('User found, checking password...');
    let isMatch = false;
    try {
      if (typeof user.matchPassword !== 'function') {
        console.error('matchPassword is not a function on user model');
        return res.status(500).json({ message: 'Internal server error: invalid user model' });
      }
      isMatch = await user.matchPassword(password);
    } catch (pwErr) {
      console.error('Error while comparing passwords:', pwErr);
      return res.status(500).json({ message: 'Error verifying password', error: pwErr.message });
    }

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);
    // Send success response
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      institutionId: user.institutionId,
      roleId: user.roleId,
      token: generateToken(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get current user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = req.user;
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      institutionId: user.institutionId,
      roleId: user.roleId,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update current user's profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, password, institutionId } = req.body;

    // Check email/username uniqueness if changed
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (institutionId) user.institutionId = institutionId;

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password; // will be hashed by pre-save hook
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      institutionId: updated.institutionId,
      roleId: updated.roleId,
      token: generateToken(updated),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Update any user (admin only)
router.put('/:userId', protect, async (req, res) => {
  try {
    if (req.user.roleId !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update users' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, password, institutionId, roleId } = req.body;

    // Check email/username uniqueness if changed
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (institutionId) user.institutionId = institutionId;
    if (roleId && ['admin', 'physicalStaff', 'financialStaff', 'registrar'].includes(roleId)) user.roleId = roleId;

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password; // will be hashed by pre-save hook
    }

    const updated = await user.save();

    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      institutionId: updated.institutionId,
      roleId: updated.roleId,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:userId', protect, async (req, res) => {
  try {
    if (req.user.roleId !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting the last admin
    if (user.roleId === 'admin') {
      const adminCount = await User.countDocuments({ roleId: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

export default router;