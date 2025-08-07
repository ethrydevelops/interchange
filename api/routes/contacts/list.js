const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.get("/channels/", sessionMiddleware, async (req, res) => {
    try {
        const rawContacts = await knex('messages')
            .select('sender_id', 'recipient_id')
            .where(function () {
                this.where('sender_id', req.session.account_id)
                    .orWhere('recipient_id', req.session.account_id);
            })
            .orderBy('created_at', 'desc');

        // TODO: also add friends list, gcs if no messages sent

        const contacts = [
            ...new Set(
                rawContacts.map(msg =>
                    msg.sender_id === req.session.account_id
                        ? msg.recipient_id
                        : msg.sender_id
                )
            )
        ];

        if (contacts.length === 0) {
            return res.json({ channels: [] });
        }

        const contactUsersPromise = knex('accounts')
            .select('id', 'username', 'openpgp_public_key')
            .whereIn('id', contacts);

        const contactUsers = await contactUsersPromise;

        for (const user of contactUsers) {
            user.type = "person";
        }

        res.json({ channels: contactUsers });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ error: "Failed to fetch contacts." });
    }
});

module.exports = router;