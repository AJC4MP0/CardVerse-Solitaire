// Imports express library for HTTP requests and building web apps
const express = require('express');
//imports mysql library for connecting server to database
const mysql = require('mysql2');

// Initalizes express app instance for routes and settings
const app = express();

//Define port number, server listens for incoming traffic
const PORT = 1234;

//Tells express that any files placed in the folder can be accessed by the browser
app.use(express.static('client'));

//database connection with credentials
const db = mysql.createConnection({
   host:        'localhost',
   user:        'root',
   password:    '!Password1015?',
   database:    'solitaire_db' 
});

// connect to database and log status
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database!');
});

// HTTP .get route for the root URL
app.get('/', (req, res) => {
    //sends text to browser
    res.send('Server is running');
});


//starts server on port and prints message to the terminal when ready
app.listen(PORT, () => {
    console.log('Server is running at port 1234')
});

// in terminal do 'node server.js'
// open http://localhost:1234 and 'Ctrl + C' in terminal to stop