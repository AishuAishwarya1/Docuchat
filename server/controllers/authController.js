const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
    });
};

module.exports = { registerUser, loginUser };