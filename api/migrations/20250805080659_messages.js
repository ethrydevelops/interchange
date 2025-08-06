/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('messages', function(table) {
        table.uuid('id').primary();

        table.uuid('sender_id').notNullable();
        table.uuid('recipient_id').notNullable();
        table.text('content').notNullable();

        table.foreign('sender_id').references('id').inTable('accounts').onDelete('CASCADE');
        table.foreign('recipient_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('messages');
};
