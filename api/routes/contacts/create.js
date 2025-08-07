const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.post("/contacts/", sessionMiddleware, async (req, res) => {
    const { name, id } = req.body;

    if ((!name && !id) || (name && id)) {
        return res.status(400).json({ error: "name OR id is required." });
    }

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
});

module.exports = router;