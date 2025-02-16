const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

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

// Route to serve signUp.html
app.get('/signUp.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'signUp.html'));
});

// Dummy in-memory "database" of users
let users = [];

// Login function
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log("Received login credentials:", { username, password });

    // Dummy user credentials (Replace this with real authentication logic)
    const validUser = {
        username: "testuser",
        password: "password123"
    };

    // Ensure values are not undefined
    if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password", success: false });
    }

    // Proper comparison
    if (username === validUser.username && password === validUser.password) {
        return res.status(200).json({ message: "Login successful", success: true });
    } else {
        return res.status(401).json({ message: "Invalid credentials", success: false });
    }
});

// Sign-up function
app.post('/signup', (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // Validate the inputs
    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ message: "Missing username or password fields", success: false });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists", success: false });
    }

    // Save the user to the "database"
    users.push({ username, password });

    return res.status(200).json({ message: "Sign-up successful", success: true });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
