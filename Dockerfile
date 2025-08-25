# Use an official Bun image as a parent image
FROM oven/bun:1.2.20

RUN apt-get update && apt-get install -y python3 build-essential

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the application files to the container
COPY . .

# Install dependencies
RUN bun install

# Build the application
RUN bun run build:heroku

# The command to run when the container starts
# This will be overridden by the command in heroku.yml
CMD ["bun", "dist/index.js", "start", "manager"]
