//download mysql library, 'mysql' is the older version
const mysql = require('mysql2');

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