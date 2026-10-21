// Imports express library for HTTP requests and building web apps
const express = require('express');

// Initalizes express app instance for routes and settings
const app = express();

//Define port number, server listens for incoming traffic
const PORT = 1234;

//Tells express that any files placed in the folder can be accessed by the browser
app.use(express.static('CardVerse-Solitaire'));

//HTTP .get route for the root URL
app.get('/', (req, res) => {
    //sends text to browser
    res.send('Server is running');
});

//starts server on port and prints message to the terminal when ready
app.listen(PORT, () => {
    console.log('Server is running at port 1234')
});

//open http://localhost:1234 and 'Ctrl + C' in terminal to stop