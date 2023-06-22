const express = require("express");
const path = require('path');

const router = express.Router();

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html'));
});
  
// router.get(["/", "/:name"], (req, res) => {
//     const greeting = "<h1>Hello From Node on Fly test!</h1>";
//     const name = req.params["name"];
//     if (name) {
//       res.send(greeting + "</br>and hello to " + name);
//     } else {
//       res.send(greeting);
//     }
// });
  
module.exports = router;