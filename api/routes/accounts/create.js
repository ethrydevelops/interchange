const express = require('express');
const router = express.Router();

router.post("/accounts/", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    
});

module.exports = router;