/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('team', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('server_id').notNullable();
    table.foreign('server_id').references('server.id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('team');
};
