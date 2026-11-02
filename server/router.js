//directory references
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { createUser } = require('./services');

//HTTP .get route for the root URL
router.get('/', (req,res) => {
    res.send('Server is running');
});

// Handles registration form submission
router.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        //Hash the password (10 salt rounds) Salt round: how many times the hashing algorithm iterates
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //bundle into an object for SET query
        const newUser = { username, email, password_hash: hashedPassword };

        //save user data to database
        createUser(newUser, (err, results) => {
            if(err) {
                console.error('Database insertion error: ', err);
                return res.status(500).json({ msg: "Error: " + err.message });
            }

            console.log('Inserted new user record');
            return res.status(200).json({ msg: "Success"});
        });
    } catch (error) {
        console.error('Hashing error:', error);
        return res.status(500).json({ msg: "Internal server error." });
    }
});
module.exports = router;