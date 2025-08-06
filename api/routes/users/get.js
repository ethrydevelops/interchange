const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.get("/users/:id", sessionMiddleware, async (req, res) => {
    let userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
    }


    try {
        let user;    

        if(userId == "me") {
            // no need for an extra query
            user = {
                id: req.session.account.account_id,
                username: req.session.account.username,
                openpgp_public_key: req.session.account.openpgp_public_key,
                created_at: req.session.account.created_at
            }
        } else {
            user = await knex('accounts')
                .select('id', 'username', 'openpgp_public_key', 'created_at')
                .where({ id: userId })
                .first();

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }
        }

        user.keys = {};
        user.keys.public = user.openpgp_public_key;
        delete user.openpgp_public_key;

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;