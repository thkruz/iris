/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.alterTable('antenna', table => {
       table.dropColumn('name');
       table.dropColumn('modem_number');
       table.dropColumn('track');
       table.dropColumn('band');
   }).then(() => {
       return knex.schema.alterTable('antenna', table => {
        table.string('band').notNullable()
       })
   })
   
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('antenna', table => {
       table.string('name');
       table.integer('modem_number');
       table.boolean('track').defaultTo(false);
       table.integer('band');
   })
};
