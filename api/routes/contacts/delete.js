const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.delete("/contacts/:id", sessionMiddleware, async (req, res) => {
    const contactId = req.params.id;

    if (!contactId) {
        return res.status(400).json({ error: "id is required" });
    }

    try {
        const contact = await knex('contacts')
            .select('contact_id')
            .where({ account_id: req.session.account_id, contact_id: contactId })
            .first();

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        await knex('contacts')
            .where({ account_id: req.session.account_id, contact_id: contactId })
            .del();

        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;