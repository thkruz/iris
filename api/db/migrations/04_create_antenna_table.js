/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('antenna', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('server_id').notNullable();
        table.foreign('server_id').references('server.id');
        table.integer('team_id').notNullable();
        table.foreign('team_id').references('team.id');
        table.integer('target_id').notNullable();
        table.foreign('target_id').references('target.id');
        table.integer('unit').notNullable();
        table.integer('modem_number').notNullable();
        table.boolean('operational').defaultTo(false);
        table.boolean('track').defaultTo(false);
        table.boolean('locked').defaultTo(false);
        table.integer('band').notNullable();
        table.double('offset').notNullable();
        table.boolean('hpa').defaultTo(false);
        table.boolean('loopback').defaultTo(true);
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('antenna');
};
