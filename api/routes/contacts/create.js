const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.post("/contacts/", sessionMiddleware, async (req, res) => {
    const { name, id } = req.body;

    if ((!name && !id) || (name && id)) {
        return res.status(400).json({ error: "name OR id is required." });
    }

    try {
        let account;

        if (name) {
            account = await knex('accounts')
                .select('id', 'username', 'openpgp_public_key')
                .where('username', name)
                .first();

            if (!account) {
                return res.status(404).json({ error: "No user found with username" });
            }
        } else {
            account = await knex('accounts')
                .select('id', 'username', 'openpgp_public_key')
                .where({ id })
                .first();

            if (!account) {
                return res.status(404).json({ error: "No user found with ID" });
            }
        }

        const recipientId = account.id;
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
            return res.status(404).json({ error: "User not found" });
        }
        
        if (isBlocked || isBlockedByRecipient) {
            return res.status(403).json({ error: "You cannot contact this user" });
        } 



        const existingContact = await knex('contacts')
            .select('contact_id')
            .where({ account_id: req.session.account_id, contact_id: account.id })
            .first();

        if (existingContact) {
            return res.status(409).json({ error: "Contact already exists" });
        }

        await knex('contacts').insert({
            id: crypto.randomUUID(),
            account_id: req.session.account_id,
            contact_id: account.id
        });

        return res.status(201).json({
            message: "Contact created successfully",
            contact: {
                id: account.id,
                username: account.username,
                public_key: account.openpgp_public_key
            }
        });
    } catch (error) {
        console.error("Error creating contact:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;