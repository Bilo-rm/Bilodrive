// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
    async signUp(req, res) {
        const { username, password } = req.body;
        
        try {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            
            const newUser = await User.create(username, password);
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    },

    async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
            
            const isMatch = await User.comparePasswords(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
            
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    }
};

module.exports = authController;