const express = require("express");
const knex = require("../../modules/database");
const router = express.Router();
const crypto = require("crypto");

router.post("/accounts/prelogin", async (req, res) => {
    const { username } = req.body;

    let accountInfo = await knex('accounts')
        .select('pbkdf2_iterations', 'pbkdf2_salt', 'enc_pbkdf2_salt')
        .where({ username })
        .first();

    let accountExists = true;

    if(!accountInfo) {
        accountExists = false;

        accountInfo = {
            pbkdf2_iterations: 600_000,
            pbkdf2_salt: null,
            enc_pbkdf2_salt: null
        }
    }

    const accountInfoObject = {
        auth: {
            pbkdf2: {
                iterations: accountInfo.pbkdf2_iterations,
                salt: accountInfo.pbkdf2_salt != null ? accountInfo.pbkdf2_salt.toString('base64') : null
            }
        },
        /*encryption: {
            pbkdf2: {
                iterations: accountInfo.pbkdf2_iterations,
                salt: accountInfo.enc_pbkdf2_salt != null ? accountInfo.enc_pbkdf2_salt.toString('base64') : null
            }
        }*/
    }

    res.json({
        kdf: accountExists ? 1 : 0,
        ...accountInfoObject
    })
});

module.exports = router;
