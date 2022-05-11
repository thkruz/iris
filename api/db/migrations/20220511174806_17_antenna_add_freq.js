/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.alterTable('antenna', table => {
        table.double('frequency');
    })
    
 };
 
 /**
  * @param { import("knex").Knex } knex
  * @returns { Promise<void> }
  */
 exports.down = function(knex) {
   return knex.schema.alterTable('antenna', table => {
        table.dropColumn('frequency');
    })
 };
 