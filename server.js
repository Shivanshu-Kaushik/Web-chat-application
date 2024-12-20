const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/chat_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Failed:', err));

// Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    password: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const newUser = new User({ username, phone, password });
        await newUser.save();
        res.status(201).send('User registered successfully!');
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send('Phone number or username already registered.');
        } else {
            console.error('Error saving user:', error);
            res.status(500).send('Internal server error.');
        }
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ phone: username }, { username: username }]
        });

        if (!user || user.password !== password) {
            return res.status(400).send('Invalid username or password.');
        }

        res.status(200).send('Login successful!');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal server error.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
