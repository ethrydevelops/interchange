const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.get("/channels/", sessionMiddleware, async (req, res) => {
    try {
        const [rawContacts, manualContacts] = await Promise.all([
            knex('messages')
                .select('sender_id', 'recipient_id', 'created_at')
                .where(function () {
                    this.where('sender_id', req.session.account_id)
                        .orWhere('recipient_id', req.session.account_id);
                })
                .orderBy('created_at', 'desc'),
        
            knex('contacts')
                .select('contact_id', 'created_at')
                .where({ account_id: req.session.account_id })
                .orderBy('created_at', 'desc')
        ]);
        
        // TODO: also add friends list, gcs if no messages sent
    
        const contactTimestamps = new Map();
        
        for (const msg of rawContacts) {
            const otherId = msg.sender_id === req.session.account_id
                ? msg.recipient_id
                : msg.sender_id;
        
            // keep only the latest timestamp per contact
            const existingTimestamp = contactTimestamps.get(otherId);
            if (!existingTimestamp || new Date(msg.created_at) > new Date(existingTimestamp)) {
                contactTimestamps.set(otherId, msg.created_at);
            }
        }
        
        for (const manual of manualContacts) {
            const existingTimestamp = contactTimestamps.get(manual.contact_id);
            if (!existingTimestamp || new Date(manual.created_at) > new Date(existingTimestamp)) {
                contactTimestamps.set(manual.contact_id, manual.created_at);
            }
        }
        
        // sort contacts by timestamp
        const contacts = Array.from(contactTimestamps.entries())
            .sort((a, b) => new Date(b[1]) - new Date(a[1])) 
            .map(entry => entry[0]); // get only contact IDs
        
        if (contacts.length === 0) {
            return res.json({ type: "all_channels", count: 0, channels: [] });
        }
        
        const contactUsers = await knex('accounts')
            .select('id', 'username', 'openpgp_public_key')
            .whereIn('id', contacts);
        
        for (const user of contactUsers) {
            user.keys = {};
            user.keys.public = user.openpgp_public_key;
            delete user.openpgp_public_key; 

            user.type = "person";
        }
        
        res.json({ type: "all_channels", count: contactUsers.length, channels: contactUsers }); // <-- manual friends + messages (all channels)    
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ error: "Failed to fetch contacts." });
    }
});

router.get("/contacts/", sessionMiddleware, async (req, res) => {
    // get only contacts
    try {
        const contacts = await knex('contacts')
            .select('contact_id', 'created_at')
            .where({ account_id: req.session.account_id })
            .orderBy('created_at', 'desc');

        if (contacts.length === 0) {
            return res.json({ type: "friends_only", count: 0, contacts: [] });
        }

        const contactIds = contacts.map(contact => contact.contact_id);

        const contactUsers = await knex('accounts')
            .select('id', 'username', 'openpgp_public_key')
            .whereIn('id', contactIds);

        for (const user of contactUsers) {
            user.keys = {};
            user.keys.public = user.openpgp_public_key;
            delete user.openpgp_public_key; 
            
            user.type = "person";
        }

        res.json({ type: "friends_only", count: contactUsers.length, contacts: contactUsers }); // <-- manual friends
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ error: "Failed to fetch contacts." });
    }
});

module.exports = router;