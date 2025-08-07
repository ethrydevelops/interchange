const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.get("/blocks", sessionMiddleware, async (req, res) => {
    try {
        const blockedAccounts = await knex('blocks')
            .join('accounts', 'blocks.blocked_account_id', 'accounts.id')
            .select(
                'accounts.id',
                'accounts.username'
            )
            .where('blocks.account_id', req.session.account_id);

        res.status(200).json(blockedAccounts);
    } catch (error) {
        console.error("Error fetching blocks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;