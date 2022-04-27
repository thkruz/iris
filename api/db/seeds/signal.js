/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('signal').del()
  await knex('signal').insert([
    {id: 1, id_server: 1, id_target: 1, frequency: 1250, power: -45, bandwidth: 10, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov'},
    {id: 2, id_server: 1, id_target: 1, frequency: 1300, power: -45, bandwidth: 10, modulation: '8QAM', fec: '3/4', feed:'testVid.mov'},
    {id: 3, id_server: 1, id_target: 1, frequency: 1350, power: -45, bandwidth: 10, modulation: '8QAM', fec: '3/4', feed:'testVid.mp4'}
  ]);
};
