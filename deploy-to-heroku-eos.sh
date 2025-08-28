
#!/usr/bin/env bash

# Create app
heroku create bennyfi-resource-provider --team bennyfi --remote bennyfi-resource-provider

# Enable app to be run using a docker container
heroku stack:set container --app bennyfi-resource-provider

# Set env vars for the app example use the set env var script
./set-env-eos.sh

git push bennyfi-resource-provider master

# scale the app to 1 dyno, basically run the app
heroku ps:scale worker=1:basic --app bennyfi-resource-provider

# check if app is running
# heroku ps --app bennyfi-resource-provider

# view app info
# heroku apps:info --app bennyfi-resource-provider

# view logs
# heroku logs --tail --app bennyfi-resource-provider


# destroy the app
# heroku apps:destroy --app bennyfi-jobs-staging --confirm bennyfi-jobs-staging

