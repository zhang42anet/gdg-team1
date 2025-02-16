const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3006;

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// 🟢 **User Login (Authenticate with Database)**
app.post('/login', (req, res) => {
  const { userEmail, password } = req.body;

  const sql = 'SELECT userID FROM users WHERE userEmail = ? AND password = ?';
  db.query(sql, [userEmail, password], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Database error', success: false });
      return;
    }
    
    if (result.length > 0) {
      res.status(200).json({ message: 'Login successful', success: true, userID: result[0].userID });
    } else {
      res.status(401).json({ message: 'Invalid credentials', success: false });
    }
  });
});

// 🟢 **Add a Todo (Default `currStatus = 0` for Incomplete)**
app.post('/add-todo', (req, res) => {
  const { userID, toDo } = req.body;
  const sql = 'INSERT INTO todo (userID, toDo, currStatus) VALUES (?, ?, 0)';  // 0 = Incomplete

  db.query(sql, [userID, toDo], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Todo added successfully.', id: result.insertId });
  });
});

// 🟢 **Mark Todo as Completed (`currStatus = 1`)**
app.put('/complete-todo/:id', (req, res) => {
  const todoID = req.params.id;
  const sql = 'UPDATE todo SET currStatus = 1 WHERE id = ?';

  db.query(sql, [todoID], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Todo marked as completed!' });
  });
});

// 🟢 **Fetch Todos for a Specific User**
app.get('/get-todos/:userID', (req, res) => {
  const userID = req.params.userID;
  const sql = 'SELECT * FROM todo WHERE userID = ?';

  db.query(sql, [userID], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// 🟢 **Start the Server**
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

