/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.alterTable('receiver', table => {
        table.dropColumn('modem_number');
        table.integer('number');
        table.dropColumn('power');
        table.integer('antenna_id');
        table.foreign('antenna_id').references('antenna.id');
        table.string('modulation');
        table.string('fec');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('receiver', table => {
        table.integer('modem_number');
        table.dropColumn('number');
        table.double('power');
        table.dropForeign('antenna_id');
        table.dropColumn('antenna_id');
        table.dropColumn('modulation');
        table.dropColumn('fec');
    });
};
