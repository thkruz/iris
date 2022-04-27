/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('target').del()
  await knex('target').insert([
    {id: 1, name: 'ARKE 3G'},
    {id: 2, name: 'AURORA 2B'},
    {id: 3, name: 'AUXO STAR'},
    {id: 4, name: 'ENYO'},
    {id: 5, name: 'HASHCOMM 7'},
    {id: 6, name: 'HUF UHF FO'},
    {id: 7, name: 'MERCURY PAWN'},
    {id: 8, name: 'NYXSAT'},
    {id: 9, name: 'RASCAL'},
    {id: 10, name: 'WILL 1-AM'},
  ]);
};
