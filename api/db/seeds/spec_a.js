/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('spec_a').del()
  await knex('spec_a').insert([
    {id: 1, id_server: 1, id_team: 1, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 2, id_server: 1, id_team: 1, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 3, id_server: 1, id_team: 1, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 4, id_server: 1, id_team: 1, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 5, id_server: 1, id_team: 1, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 6, id_server: 1, id_team: 1, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 7, id_server: 1, id_team: 1, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 8, id_server: 1, id_team: 1, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 9, id_server: 1, id_team: 2, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 10, id_server: 1, id_team: 2, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 11, id_server: 1, id_team: 2, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 12, id_server: 1, id_team: 2, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 13, id_server: 1, id_team: 2, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 14, id_server: 1, id_team: 2, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 15, id_server: 1, id_team: 2, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 16, id_server: 1, id_team: 2, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 17, id_server: 1, id_team: 3, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 18, id_server: 1, id_team: 3, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 19, id_server: 1, id_team: 3, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 20, id_server: 1, id_team: 3, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 21, id_server: 1, id_team: 3, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 22, id_server: 1, id_team: 3, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 23, id_server: 1, id_team: 3, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 24, id_server: 1, id_team: 3, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 25, id_server: 1, id_team: 4, unit: 1, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 26, id_server: 1, id_team: 4, unit: 1, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 27, id_server: 1, id_team: 4, unit: 2, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 28, id_server: 1, id_team: 4, unit: 2, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 29, id_server: 1, id_team: 4, unit: 3, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 30, id_server: 1, id_team: 4, unit: 3, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 31, id_server: 1, id_team: 4, unit: 4, number: 1, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260},
    {id: 32, id_server: 1, id_team: 4, unit: 4, number: 2, operational: true, frequency: 1250, span: 50, trace: true, marker1freq: 1240, marker2freq: 1260}
  ]);
  await knex.raw('SELECT SETVAL(pg_get_serial_sequence(\'spec_a\',\'id\'), (SELECT MAX(id) FROM spec_a) )');
};
