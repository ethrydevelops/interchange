const express = require('express');
const bcrypt = require('bcrypt');
const knex = require("../../modules/database.js");
const crypto = require('crypto');

const router = express.Router();

router.post("/accounts/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const account = await knex('accounts')
            .where({ username })
            .first();

        if (!account) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await knex('sessions').insert({
            id: crypto.randomUUID(),
            account_id: account.id,
            token: tokenHash
        });

        res.json({
            message: "Login successful",

            uuid: account.id,
            token: token,
            
            keys: {
                public: account.openpgp_public_key,
                private: account.encrypted_openpgp_private_key,
            },

            encryption: {
                pbkdf2: {
                    iterations: account.pbkdf2_iterations,
                    salt: account.enc_pbkdf2_salt != null ? account.enc_pbkdf2_salt.toString('base64') : null
                }
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to log in." });
    }
});

module.exports = router;