//directory references
const path = require("path");

//page listeners, for buttons
var router = function(app){
        app.get('/', function(req, res) {
            res.status(200).sendFile(path.join(__dirname + "/../client/index.html"));
        })
};