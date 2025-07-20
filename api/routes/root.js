const express = require('express');
const { version } = require('../package.json');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: "interchange api",
        version, // TODO: remember to update, have a building script in package.json or something?
    });
});

module.exports = router;