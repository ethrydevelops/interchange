/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('blocks', function(table) {
        table.uuid('account_id').notNullable();
        table.foreign('account_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.uuid('blocked_account_id').notNullable();
        table.foreign('blocked_account_id').references('id').inTable('accounts').onDelete('CASCADE');

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('blocks');
};
