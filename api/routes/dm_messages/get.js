const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.get("/channels/:withId/messages", sessionMiddleware, async (req, res) => {
    const withId = req.params.withId;
    const myId = req.session.account_id;

    if (withId == myId) {
        return res.status(400).json({ error: "You cannot message yourself" });
    }

    try {
        const userExists = await knex('accounts')
            .select('id')
            .where({ id: withId })
            .first();

        if (!userExists) {
            return res.status(404).json({ error: "You do not have a conversation with this user" });
        }

        let limit = req.query.limit || 50;
        let offset = req.query.offset || 0;

        if (limit !== '-1') {
            limit = parseInt(limit, 10);
            if (isNaN(limit) || limit <= 0) limit = 50;
        }

        offset = parseInt(offset, 10);
        if (isNaN(offset) || offset < 0) offset = 0;

        // build query
        let query = knex('messages')
            .where(function () {
                this.where({ recipient_id: withId, sender_id: myId })
                    .orWhere({ sender_id: withId, recipient_id: myId });
            })
            .orderBy('created_at', 'desc')
            .offset(offset);

        if (limit !== '-1') {
            query = query.limit(limit);
        }

        const messages = await query;
        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages." });
    }
});

module.exports = router;