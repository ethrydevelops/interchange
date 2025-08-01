/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('sessions', function(table) {
        table.uuid('id').primary();
        
        table.uuid('account_id').notNullable();
        table.foreign('account_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.string('token', 64).notNullable().unique(); // sha256 hash of token

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('sessions');
};
