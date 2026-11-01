//directory references
const express = require("express");
const router = express.Router();

//HTTP .get route for the root URL
router.get('/', (req,res) => {
    res.send('Server is running');
});

module.exports = router;