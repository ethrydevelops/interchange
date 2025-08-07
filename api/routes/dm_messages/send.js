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
        const [
            recipientExists,
            isBlocked,
            isBlockedByRecipient
        ] = await Promise.all([
            // check if recipient exists
            knex('accounts')
                .select('id')
                .where({ id: recipientId })
                .first(),
        
            // check if I blocked the recipient
            knex('blocks')
                .select('blocked_account_id')
                .where({ account_id: req.session.account_id, blocked_account_id: recipientId })
                .first(),
        
            // check if recipient blocked me
            knex('blocks')
                .select('blocked_account_id')
                .where({ account_id: recipientId, blocked_account_id: req.session.account_id })
                .first()
        ]);
        
        if (!recipientExists) {
            return res.status(404).json({ error: "Recipient not found" });
        }
        
        if (isBlocked || isBlockedByRecipient) {
            return res.status(403).json({ error: "You cannot send a message to this user" });
        } 


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