const express = require('express');
const cors = require('cors');
const app = express();
const env = process.env.NODE_ENV || 'development'
const config = require('../knexfile')[env]
const knex = require('knex')(config)

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.status(200).send('App root route running');
})

app.get('/authors', (request, response) => {
    knex('app_authors')
        .select('*')
        .then(authorRecords => {
            let responseData = authorRecords.map(author => ({ firstName: author.first_name, lastName: author.last_name}));
            response.status(200).send(responseData)
        });
});

app.get('/signals', (request, response) => {
    knex('signals')
        .select('*')
        .then(signalRecords => {
            let responseData = signalRecords.map(signal => ({
                id: signal.id,
                user_id: signal.user_id,
                amplitude: signal.amplitude,
                frequency: signal.frequency,
                power: signal.power,
                bandwidth: signal.bandwidth
            }));
            response.status(200).send(responseData)
        });
});

app.post('/signals', (request, response) => {
    const { user_id, amplitude, frequency, power, bandwidth } = request.body;
    knex('signals')
        .insert({
            user_id: user_id,
            amplitude: amplitude,
            frequency: frequency,
            power: power,
            bandwidth: bandwidth
        })
        .then(() => {
            response.status(200).send('Signal updated')
        })
        .catch(error => {
            response.status(500).send(error)
        })
});

app.post('/users', (request, response) => {
    const { name, isInstructor } = request.body;
    knex('users')
        .insert({
            name: name,
            isInstructor: isInstructor
        })
        .then(() => {
            response.status(200).send('User created')
        })
        .catch(error => {
            response.status(500).send(error)
        })
});



module.exports = app;