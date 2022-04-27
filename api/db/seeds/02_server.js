/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('server').del()
  await knex('server').insert([
    {id: 1, name: '000533'}
  ]);
};
