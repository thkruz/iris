/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('target').del()
  await knex('target').insert([
    {id: 1, name: 'WILL 1-AM'},
    {id: 2, name: 'HUFUHF FO'},
    {id: 3, name: 'ARKE 3G'},
    {id: 4, name: 'HASHCOMM 7'},
    {id: 5, name: 'NYXSAT'},
    {id: 6, name: 'RASCAL'},
    {id: 7, name: 'AURORA 2B'},
    {id: 8, name: 'MERCURY PAWN'},
    {id: 9, name: 'AUXO STAR'},
    {id: 10, name: 'ENYO'},
  ]);
};
