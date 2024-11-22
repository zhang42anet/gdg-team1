const express = require('express');
const path = require('path');

// //Google APIs (ran "npm install googleapis" first)
// const fs = require('fs');
// const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// // Load credentials
// const credentials = JSON.parse(fs.readFileSync('GDGcredentials.json'));
// const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
// const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// // Scopes for Calendar API
// const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Basic route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

//route to serve login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// // Route to login and authenticate with Google
// app.get('/login', (req, res) => {
//     const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES,
//     });
//     res.redirect(authUrl);
// });

// // OAuth callback to handle Google response
// app.get('/oauth2callback', async (req, res) => {
//     const code = req.query.code;
//     try {
//         const { tokens } = await oAuth2Client.getToken(code);
//         oAuth2Client.setCredentials(tokens);
//         fs.writeFileSync('token.json', JSON.stringify(tokens));
//         res.send('Authentication successful! You can now close this window.');
//     } catch (error) {
//         console.error('Error during authentication', error);
//         res.status(500).send('Authentication failed');
//     }
// });

// // API route to fetch calendar events
// app.get('/api/events', async (req, res) => {
//     try {
//         // Load saved tokens
//         const token = JSON.parse(fs.readFileSync('token.json'));
//         oAuth2Client.setCredentials(token);

//         const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
//         const events = await calendar.events.list({
//             calendarId: 'primary',
//             timeMin: new Date().toISOString(),
//             maxResults: 10,
//             singleEvents: true,
//             orderBy: 'startTime',
//         });
//         res.json(events.data.items);
//     } catch (error) {
//         console.error('Error fetching events', error);
//         res.status(500).send('Failed to fetch events');
//     }
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});