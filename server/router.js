//directory references
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { createUser, findUserByUsername, findUserByEmail } = require('./services');

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

//Handles lolgin form submission, email or password
router.post('/api/login', async (req, res) => {
    const {username: userInput, password} = req.body;

    try {
        //determine whether input is an email or username using '@'
        const isEmail = userInput.includes('@');
        //if the input is an email use first function (':' = 'if not') use second function
        const searchFunction = isEmail ? findUserByEmail : findUserByUsername

        searchFunction(userInput, async(err, user) => {
            if(err) {
                console.error('Database error during login: ', err);
                return res.status(500).json({msg: "Internal server error."});
            }

            //check if user account exists
            if(!user) {
                return res.status(400).json({msg: "Invalid username/email or password"});
            }

            //Compare password to hashed password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if(!passwordMatch) {
                return res.status(400).json({msg: "Invalid username/email or password"});
            }

            console.log('User logged in successfully: ' + user.username);
            return res.status(200).json({msg: "Login Successful!" });
        });
    } catch (error) {
        console.log('Login error:', error);
        return res.status(500).json({msg: "Internal server error."});
    }
});
module.exports = router;