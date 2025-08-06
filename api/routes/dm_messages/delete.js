const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");
const crypto = require('crypto');

const router = express.Router();

router.delete("/channels/:recipient/messages/:message_id/", sessionMiddleware, async (req, res) => {
    const recipientId = req.params.recipient; // probably not needed, just keep structure
    const messageId = req.params.message_id;

    try {
        const senderId = req.session.account_id;

        const message = await knex('messages')
            .select('id', 'sender_id', 'recipient_id')
            .where({ id: messageId })
            .first();

        if (!message) {
            return res.status(404).json({ error: "Message not found." });
        }

        if (message.sender_id !== senderId) {
            return res.status(403).json({ error: "You cannot delete this message." });
        }

        await knex('messages')
            .where({ id: messageId, sender_id: senderId })
            .del();

        res.status(200).json({ message: "Message deleted successfully." });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ error: "Failed to delete message." });
    }
});

module.exports = router;