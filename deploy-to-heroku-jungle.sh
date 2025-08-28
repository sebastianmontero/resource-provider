
#!/usr/bin/env bash

# Create app
heroku create bennyfi-resource-provider-jngl --team bennyfi --remote bennyfi-resource-provider-jngl

# Enable app to be run using a docker container
heroku stack:set container --app bennyfi-resource-provider-jngl

# Set env vars for the app example use the set env var script
./set-env-jungle.sh

git push bennyfi-resource-provider-jngl master

# scale the app to 1 dyno, basically run the app
heroku ps:scale worker=1:basic --app bennyfi-resource-provider-jngl

# check if app is running
# heroku ps --app bennyfi-resource-provider-jngl

# view app info
# heroku apps:info --app bennyfi-resource-provider-jngl

# view logs
# heroku logs --tail --app bennyfi-resource-provider-jngl


# destroy the app
# heroku apps:destroy --app bennyfi-jobs-staging --confirm bennyfi-jobs-staging

