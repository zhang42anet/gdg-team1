const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Route to serve login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Login function
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy user credentials (Replace this with real authentication logic)
    const validUser = {
        username: "testuser",
        password: "password123"
    };

    if (username === validUser.username && password === validUser.password) {
        res.status(200).json({ message: "Login successful", success: true });
    } else {
        res.status(401).json({ message: "Invalid credentials", success: false });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
