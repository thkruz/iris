/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = function(knex) {
    return knex.schema.alterTable('receiver', table => {
        table.double('frequency');
    }).then(() => {
        return knex.schema.alterTable('antenna'), table => {
            table.dropColumn('frequency')
        }
    })
 };
 
 /**
  * @param { import("knex").Knex } knex
  * @returns { Promise<void> }
  */
 exports.down = function(knex) {
   return knex.schema.alterTable('receiver', table => {
        table.dropColumn('frequency');
    }).then(() => {
        return knex.schema.alterTable('antenna'), table => {
            table.double('frequency')
        }
    })
 };
 