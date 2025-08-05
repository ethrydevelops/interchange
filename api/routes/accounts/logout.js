const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.post("/accounts/logout", sessionMiddleware, async (req, res) => {
    try {
        const sessionId = req.session.id;
        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required." });
        }

        await knex('sessions')
            .where({ id: sessionId })
            .del();

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;