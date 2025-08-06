const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");
const crypto = require('crypto');

const router = express.Router();

router.post("/channels/:recipient/messages/", sessionMiddleware, async (req, res) => {
    const recipientId = req.params.recipient;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "content is required." });

    try {
        const senderId = req.session.account_id;
        const msgId = crypto.randomUUID();

        await knex('messages').insert({
            id: msgId,
            sender_id: senderId,
            recipient_id: recipientId,
            content
        });

        res.status(201).json({ id: msgId, message: "Sent!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message." });
    }
});

module.exports = router;