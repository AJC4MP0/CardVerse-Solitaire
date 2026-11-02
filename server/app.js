// imports express library for HTTP requests and building web apps
const express = require('express');
//imports router containing for the application endpoints
const router = require('./router');

//initializes the express app instance for routes and settings
const app = express();
//port number
const PORT = 1234;

//Middleware to parse incoming data from HTML forms
// URL encoded intercepts incoming raw text, parses and decodes, then wraps them into a js object attached to req.body
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//tells express that any file in the client folder can be accessed by the browser
app.use(express.static('client'));
//mounts router module onto app
app.use('/', router);

//starts server and prints message
app.listen(PORT, () => {
    console.log('Server is running on PORT 1234');
});