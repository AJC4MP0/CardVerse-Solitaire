// Imports the mysql2 library for connecting the server to the database
const mysql = require('mysql2');

// Database connection configuration with credentials
const db = mysql.createConnection({
    host:     'localhost',
    user:     'root',
    password: '!Password1015?',
    database: 'solitaire_db' 
});

// Connect to database and log status
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database!');
});

// Export the connection so other files can use it
module.exports = db;