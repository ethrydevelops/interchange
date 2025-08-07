/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('contacts', function(table) {
        table.uuid('id').primary();
        
        table.uuid('account_id').notNullable();
        table.foreign('account_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.uuid('contact_id').notNullable();
        table.foreign('contact_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('contacts');
};
