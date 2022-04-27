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
        .then(responseData => {
            response.status(200).send(responseData);
        });
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ /server ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/server', (request, response) => {
    knex('server')
        .select('*')
        .then(serverRecords => {
            response.status(200).send(serverRecords)
        });
});

app.get('/server/:id', (request, response) => {
    knex('server')
        .select('*')
        .where('id', request.params.id)
        .then(serverRecords => {
            response.status(200).send(serverRecords);
        });
});

app.post('/server', (request, response) => {
    knex('server')
        .insert({
            seed: request.body.seed,
            name: request.body.name
        })
        .then(() => {
            response.status(201).send('Server created')
        })
        .catch(error => {
            response.status(500).send(error)
        }
    );
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ /signal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/signal', (request, response) => {
    knex('signal')
        .select('*')
        .then(signalRecords => {
            response.status(200).send(signalRecords);
        });
});

app.post('/signal', (request, response) => {
    const { server_id, team_id, target_id, frequency, power, bandwidth, modulation, fec, feed, operational } = request.body;
    knex('signal')
        .insert({
            server_id,
            team_id,
            target_id,
            frequency,
            power,
            bandwidth,
            modulation,
            fec,
            feed,
            operational
        })
        .then(() => {
            response.status(200).send('Signal updated')
        })
        .catch(error => {
            response.status(500).send(error)
        })
});

app.get('/signal/:id', (request, response) => {
    const { id } = request.params;
    knex('signal')
        .where('id', id)
        .select('*')
        .then(signalRecords => {
            response.status(200).send(responseData);
        });
});




module.exports = app;