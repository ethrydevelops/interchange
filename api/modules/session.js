const crypto = require('crypto');
const knex = require("./database.js");

async function middleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header." });
        }

        const token = authHeader.split(' ')[1];
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const session = await knex('sessions')
            .where({ token: tokenHash })
            .first();

        if (!session) {
            return res.status(401).json({ error: "Unauthorized: Invalid session token." });
        }

        const account = await knex('accounts')
            .where({ id: session.account_id })
            .first();

        if (!account) {
            return res.status(401).json({ error: "Unauthorized: Account not found." });
        }

        req.session = { ...session, account }; // attach session and account info

        next();
    } catch (error) {
        console.error("Session middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = middleware;