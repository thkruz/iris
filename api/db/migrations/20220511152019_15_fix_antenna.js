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
       table.string('band').notNullable();
       
   })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
