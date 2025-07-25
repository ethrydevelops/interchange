/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('accounts', function(table) {
        table.uuid('id').primary();
        table.string('username', 32).notNullable().unique();

        table.text('password').notNullable(); // <-- hashed password, derived from pbkdf2 on the client-side

        /* pbkdf2 - for password hashing */
        table.binary('pbkdf2_salt').notNullable();
        table.integer('pbkdf2_iterations').notNullable();

        /* enc_pbkdf2 - for encryption of openpgp key */
        table.binary('enc_pbkdf2_salt').notNullable();
        table.integer('enc_pbkdf2_iterations').notNullable();
       
        /* openpgp / final encryption */
        table.text('encrypted_openpgp_private_key').notNullable();
        table.text('openpgp_public_key').notNullable();
        
        // timestamps
        table.timestamps(true, true);
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('accounts');
};