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

//Function insert a new user into the database
const createUser = (userData, callback) => {
    //MYSQL allows passing an object using SET
    const query = 'INSERT INTO users SET ?';
    db.query(query, userData, (err, results) => {
        //error
        if (err) return callback(err);
        //success
        callback(null, results)
    });
};

// Export the connection so other files can use it
module.exports = { createUser, db};