TODO: 
1. Create Volumes for API and UI - set up in docker compose
1. Set up deployment pipeline
1. Map node_modules as volume in docker-compose
1. Set up Env variables for email and API names.

TODO: NICE TO HAVE
1. Web pack deploy on the pipeline
1. break apart UI and API repositories with Manifest file repository
1. install and run cypress tests

# sdi-capstone-proof-of-concept


To set up application:

`git clone <url here>`

create volumes
* db volume somehow

* UI volume: 
    * `docker service create  --mount 'type=bind,src=/Users/jeffhaddock/code/blended/capstone-proof/sdi-capstone-proof-of-concept/ui/src,target=/app/src'  --name capstone-ui-volume node:alpine`

Need to include directions for how to 
start up Docker containers and make 
sure database is already created.

to run a particular env for make command:
`knex migrate:make --env local creat_about_table`

to run against the running database (if 'docker-compose up' has been executed)
`knex migrate:latest --env local`


Check Heroku Logs
`heroku logs --tail -a bsdi-poc-api`
