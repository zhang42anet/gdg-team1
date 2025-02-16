const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3006;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

// MySQL Connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Tel1232116027.',
  database: 'GDGsT1'
});

db.connect((err) => { // check if the MySQL is connected 
  if (err) throw err;
  console.log('MySQL Connected...'); 
});

// Serve static files
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

// User Sign-Up
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Check if email already exists
    const checkUserSQL = 'SELECT userID FROM users WHERE userEmail = ?';
    db.query(checkUserSQL, [email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error", success: false });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "Email already exists", success: false });
        }

        // Insert new user
        const insertUserSQL = 'INSERT INTO users (userEmail, password, name) VALUES (?, ?, ?)';
        db.query(insertUserSQL, [email, password, name], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error", success: false });
            }

            res.status(201).json({ message: "Sign-up successful!", success: true });
        });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT userID FROM users WHERE userEmail = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error", success: false });
        }

        if (result.length > 0) {
            res.status(200).json({ message: "Login successful", success: true, userID: result[0].userID });
        } else {
            res.status(401).json({ message: "Invalid credentials", success: false });
        }
    });
});


// **Add a Todo (Default `currStatus = 0` for Incomplete)**
app.post('/add-todo', (req, res) => {
    const { userID, toDo } = req.body;

    // Check if the todo already exists for the user
    const checkSQL = 'SELECT id FROM todo WHERE userID = ? AND toDo = ?';
    db.query(checkSQL, [userID, toDo], (err, result) => {
        if (err) {
            console.error("Error checking existing todo:", err);
            res.status(500).json({ message: 'Database error', success: false });
            return;
        }

        if (result.length > 0) {
            res.json({ message: 'Todo already exists!', success: false });
            return;
        }

        // Insert if not duplicate
        const insertSQL = 'INSERT INTO todo (userID, toDo, currStatus) VALUES (?, ?, 0)';
        db.query(insertSQL, [userID, toDo], (err, result) => {
            if (err) {
                console.error("Error inserting todo:", err);
                res.status(500).json({ message: 'Database error', success: false });
                return;
            }

            res.json({ message: 'Todo added successfully.', id: result.insertId, success: true });
        });
    });
});

// Mark Todo as Completed (`currStatus = 1`)
app.put('/complete-todo/:id', (req, res) => {
    const todoID = req.params.id;

    console.log(`Updating todo ID: ${todoID}`); // ✅ Debugging log

    const sql = 'UPDATE todo SET currStatus = 1 WHERE id = ?';

    db.query(sql, [todoID], (err, result) => {
        if (err) {
            console.error("Error updating todo:", err);
            res.status(500).json({ message: 'Database error', success: false });
            return;
        }

        console.log("Update result:", result); // ✅ Debugging log

        if (result.affectedRows > 0) {
            res.json({ message: 'Todo marked as completed!', success: true });
        } else {
            res.json({ message: 'Todo not found', success: false });
        }
    });
});




// **Fetch Todos for a Specific User**
app.get('/get-todos/:userID', (req, res) => {
  const userID = req.params.userID;
  const sql = 'SELECT * FROM todo WHERE userID = ?';

  db.query(sql, [userID], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// *Start the Server**
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

