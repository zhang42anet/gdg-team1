const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'GDGcredentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
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

/**
 * Load or request or authorization to call APIs.
 *
 */
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

/**
 * Lists the next 2 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

//'npm install mysql2' in terminal
const mysql = require('mysql2/promise');

//when you first run this, it will prompt you to sign in with your google account
//after that it will store your account, so the code will run automatically
//can't run this server and this code at the same time
async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.events.list({
    calendarId: 'primary',
    //starting point from when to load events (currently it's set to be today's date)
    timeMin: new Date().toISOString(),
    //how many events to load following the given start date
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;

  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  
  //Database connection
  const connection = await mysql.createConnection({
    host: '138.110.195.38',
    user: 'Annette',
    password: 'GDGsteam1!',
    database: 'gdgsteam1'
  });

  console.log('Upcoming 5 events:');
  for (const event of events) {
    const title = event.summary || 'No title';
    const description = event.description || 'No description';

    //start looks like '2024-12-03T16:45:00-05:00'
    const start = event.start.dateTime || event.start.date;
    //splitStart splits 'start' into the part before and after the 'T' and puts into an array
    const splitStart = start.split('T');
      //startDate takes the first half of start
      const startDate = splitStart[0];
      //startTime takes the other half of start while ommitting '-05:00' (an unnecessary timezone indicator)
      const startTime = splitStart[1].split('-')[0];

    //same idea with the end time
    const end = event.end.dateTime || event.end.date;
    const splitEnd = end.split('T');
      const endDate = splitEnd[0];
      const endTime = splitEnd[1].split('-')[0];

    const location = event.location || 'No location provided';
      
    const simplifiedEvent = { title, startTime, startDate, endTime, endDate, location, description };
    console.log(simplifiedEvent);

    //Insert event into the database
    await connection.execute(
      //these are the columns/categories in the Events table of our dtaabase
      'INSERT INTO Events (startTime, startDate, endTime, endDate, title, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      //these are the data from the google events to be inserted in their respective columns
      [startTime, startDate, endTime, endDate, title, location, description]
    );
  }

  // console.log('Events saved to the database!');
  // await connection.end();
}

authorize().then(listEvents).catch(console.error);