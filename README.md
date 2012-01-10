EnviornmentVariables - local
    export SUNNY_PROVIDER="AWS"

EnviornmentVariables - heroku
	heroku config:add NODE_ENV=production
	heroku config:add TALLY_MONGO=pwd
	heroku config:add SUNNY_PROVIDER="aws"
	heroku config:add SUNNY_ACCOUNT=pwd
	heroku config:add SUNNY_SECRET_KEY=pwd
	heroku config:add SUNNY_SSL="true"

Server
	nodemon --debug server.js

Deploying
	heroku login
	git push heroku master

ResultFileFormat
    XML File: partipantNumber_YYYYMMDDmmss.xml
        example: 980_20120109154938.xml
    PNG File: partipantNumber_YYYYMMDDmmss.png
        example: 980_20120109154938.png