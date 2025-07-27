const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const knex = require("../../modules/database.js");
const crypto = require('crypto');
const router = express.Router();

router.post("/accounts/", async (req, res) => {
    const { username, password, pbkdf2, encryption } = req.body;

    if (!username || !password || !pbkdf2 || !encryption) return res.status(400).json({ error: "username, password, pbkdf2 are required." });
    if (!pbkdf2 || !pbkdf2.salt || !pbkdf2.iterations) return res.status(400).json({ error: "pbkdf2.salt, pbkdf2.iterations are required." });

    if (!encryption || !encryption.pgp_private || !encryption.pgp_public || !encryption.pbkdf2_salt) return res.status(400).json({ error: "encryption.pgp_private, encryption.pgp_public, and encryption.pbkdf2_salt are required." }); // (pbkdf2_salt is used as an aes key to encrypt the final encryption key)

    if (username.length < 3 || username.length > 32) {
        return res.status(400).json({ error: "Username must be between 3 and 32 characters." });
    }

    // TODO: pgp_private is obviously encrypted before being sent to the server
    // note to self - cannot validate password as its derived from pbkdf2 on the client-side

    const passwordHash = await bcrypt.hash(password, 12);
    const accountId = uuidv4();
    
    try {
        await knex('accounts').insert({
            id: accountId,
            username,
            password: passwordHash,
            pbkdf2_salt: Buffer.from(pbkdf2.salt, 'base64'),
            pbkdf2_iterations: pbkdf2.iterations,
            enc_pbkdf2_salt: Buffer.from(encryption.pbkdf2_salt, 'base64'),
            encrypted_openpgp_private_key: encryption.pgp_private,
            openpgp_public_key: encryption.pgp_public
        });
    } catch (error) {
        console.error("Error inserting account:", error);
        return res.status(500).json({ error: "Failed to create account." });
    }

    res.status(201).json({
        message: "Account created successfully.",
        uuid: accountId
    });
});

module.exports = router;