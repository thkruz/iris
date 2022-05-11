/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex.schema.raw('TRUNCATE signal CASCADE');
  await knex('signal').del()
  await knex('signal').insert([
    {id: 1, server_id: 1, target_id: 1, frequency: 4710, power: -45, bandwidth: 5, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov', operational: 'false'},
    {id: 2, server_id: 1, target_id: 1, frequency: 4720, power: -50, bandwidth: 3, modulation: '8QAM', fec: '3/4', feed:'testVid.mov', operational: 'false'},
    {id: 3, server_id: 1, target_id: 1, frequency: 4745, power: -48, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'testVid.mp4', operational: 'false'},
    {id: 4, server_id: 1, target_id: 1, frequency: 5115, power: -46, bandwidth: 10, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov', operational: 'false'},
    {id: 5, server_id: 1, target_id: 1, frequency: 5130, power: -45, bandwidth: 6, modulation: '8QAM', fec: '3/4', feed:'testVid.mov', operational: 'false'},
    {id: 6, server_id: 1, target_id: 2, frequency: 15710, power: -45, bandwidth: 5, modulation: '8QAM', fec: '3/4', feed:'testVid.mp4', operational: 'false'},
    {id: 7, server_id: 1, target_id: 2, frequency: 15718, power: -47, bandwidth: 1, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov', operational: 'false'},
    {id: 8, server_id: 1, target_id: 2, frequency: 15720, power: -47, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'testVid.mov', operational: 'false'},
    {id: 9, server_id: 1, target_id: 2, frequency: 15722, power: -46, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'testVid.mp4', operational: 'false'},
    {id: 10, server_id: 1, target_id: 3, frequency: 16135, power: -50, bandwidth: 2, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov', operational: 'false'},
    {id: 11, server_id: 1, target_id: 3, frequency: 16140, power: -45, bandwidth: 6, modulation: '8QAM', fec: '1/2', feed:'testVid2.mov', operational: 'false'},
    {id: 12, server_id: 1, target_id: 3, frequency: 15720, power: -52, bandwidth: 10, modulation: '8QAM', fec: '3/4', feed:'testVid.mov', operational: 'false'},
    {id: 13, server_id: 1, target_id: 3, frequency: 15730, power: -48, bandwidth: 1, modulation: '8QAM', fec: '3/4', feed:'testVid.mp4', operational: 'false'},
  ]);
  await knex.raw('SELECT SETVAL(pg_get_serial_sequence(\'signal\',\'id\'), (SELECT MAX(id) FROM signal) )');
};
