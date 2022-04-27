/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('spec_a', table => {
        table.increments('id').primary();
        table.integer('server_id').notNullable();
        table.foreign('server_id').references('server.id');
        table.integer('team_id').notNullable();
        table.foreign('team_id').references('team.id');
        table.integer('unit').notNullable();
        table.integer('modem_number').notNullable();
        table.boolean('operational').defaultTo(false);
        table.double('frequency').notNullable();
        table.double('span').notNullable();
        table.string('trace1').notNullable();
        table.string('trace2').notNullable();
        table.string('trace3').notNullable();
        table.double('marker1freq').notNullable();
        table.double('marker2freq').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('spec_a');
};
