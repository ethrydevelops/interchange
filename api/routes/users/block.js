const express = require('express');
const knex = require("../../modules/database.js");
const sessionMiddleware = require("../../modules/session.js");

const router = express.Router();

router.post("/users/:uuid/block", sessionMiddleware, async (req, res) => {
    const targetId = req.params.uuid;

    if(targetId == req.session.account_id) {
        return res.status(400).json({ error: "You cannot block yourself!" });
    }

    try {
        const targetAccount = await knex('accounts')
            .select('id', 'username')
            .where({ id: targetId })
            .first();

        if (!targetAccount) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingBlock = await knex('blocks')
            .where({ account_id: req.session.account_id, blocked_account_id: targetId })
            .first();

        if (existingBlock) {
            return res.status(409).json({ error: "User is already blocked" });
        }

        await knex('blocks').insert({
            account_id: req.session.account_id,
            blocked_account_id: targetId
        });

        res.status(200).json({
            message: `User ${targetAccount.username} has been blocked successfully`,
            blockedUser: {
                id: targetAccount.id,
                username: targetAccount.username
            }
        });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/users/:uuid/block", sessionMiddleware, async (req, res) => {
    const targetId = req.params.uuid;

    try {
        const existingBlock = await knex('blocks')
            .select('blocked_account_id')
            .where({ account_id: req.session.account_id, blocked_account_id: targetId })
            .first();

        if (!existingBlock) {
            return res.status(404).json({ error: "User is not blocked" });
        }

        await knex('blocks')
            .where({ account_id: req.session.account_id, blocked_account_id: targetId })
            .del();

        res.status(200).json({ message: "User has been unblocked successfully" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

