EnviornmentVariables - local
    export SUNNY_PROVIDER="AWS"

EnviornmentVariables - heroku
	heroku config:add NODE_ENV=production
	heroku config:add SUNNY_PROVIDER="aws"
	heroku config:add SUNNY_ACCOUNT=pwd
	heroku config:add SUNNY_SECRET_KEY=pwd
	heroku config:add SUNNY_SSL="true"

Server
	nodemon --debug server.js

Deploying
	heroku login
	git push heroku master
