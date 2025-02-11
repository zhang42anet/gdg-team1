// merged the GoogleCalendarAPIIntegration.js with server.js
// currently there are only codes for storing data into "events" and "todo" tables
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3006;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Google API Scopes and File Paths
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'GDGcredentials.json');

// MySQL Database Configuration
const dbConfig = {
  host: '127.0.0.1',  // Change to '138.110.198.81' for remote
  user: 'root',
  password: 'GDGsteam1!',
  database: 'GDGsT1'
};

// Load saved credentials if they exist
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

// Save credentials after authorization
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

// Authorize the user
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// Function to fetch Google Calendar events and store them in the database
async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;

  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  // Connect to the database
  const connection = await mysql.createConnection(dbConfig);

  console.log('Upcoming 5 events:');
  for (const event of events) {
    const title = event.summary || 'No title';
    const description = event.description || 'No description';

    // Extract and format start time
    const start = event.start.dateTime || event.start.date;
    const splitStart = start.split('T');
    const startDate = splitStart[0];
    const startTime = splitStart[1]?.split('-')[0] || '';

    // Extract and format end time
    const end = event.end.dateTime || event.end.date;
    const splitEnd = end.split('T');
    const endDate = splitEnd[0];
    const endTime = splitEnd[1]?.split('-')[0] || '';

    const location = event.location || 'No location provided';

    console.log({ title, startTime, startDate, endTime, endDate, location, description });

    // Insert event into the database
    await connection.execute(
      'INSERT INTO events (startTime, startDate, endTime, endDate, title, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [startTime, startDate, endTime, endDate, title, location, description]
    );
  }

  console.log('Events saved to the database!');
  await connection.end();
}

// (TO-do) API Endpoint to add a to-do item to the database
app.post('/add-todo', async (req, res) => {
  const { userID, toDo, currStatus } = req.body;

  if (!userID || !toDo) {
    return res.status(400).json({ error: 'userID and toDo are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO todo (userID, toDo, currStatus) VALUES (?, ?, ?)',
      [userID, toDo, currStatus || 0]  // Default to 0 (incomplete)
    );
    await connection.end();

    res.status(201).json({ message: 'To-do item added successfully!' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Endpoint to fetch all to-do items from the database
app.get('/todos', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM todo');
    await connection.end();

    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch to-do items' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Fetch Google Calendar events and save them to the database
authorize().then(listEvents).catch(console.error);
