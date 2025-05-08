#!/bin/bash
set -euxo pipefail

# LMP 3.0+ goals are listed here: https://github.com/OpenLiberty/ci.maven#goals
./mvnw -version

# Start Pact Broker
cd ..
docker compose -f "pact-broker/docker-compose.yml" up -d --build

## Build the inventory service
#       package                   - Take the compiled code and package it in its distributable format.
#       liberty:create            - Create a Liberty server.
#       liberty:install-feature   - Install a feature packaged as a Subsystem Archive (esa) to the Liberty runtime.
#       liberty:deploy            - Copy applications to the Liberty server's dropins or apps directory.
cd finish
./mvnw -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -f inventory/pom.xml \
    -q clean package liberty:create liberty:install-feature liberty:deploy

## Run the integration and publish goal for inventory service
# These commands are separated because if one of the commands fail, the test script will fail and exit.
# e.g if liberty:start fails, then there is no need to run the failsafe commands.
#       liberty:start             - Start a Liberty server in the background.
#       failsafe:integration-test - Runs the integration tests of an application.
#       liberty:stop              - Stop a Liberty server.
#       failsafe:verify           - Verifies that the integration tests of an application passed.
./mvnw -ntp -f inventory/pom.xml liberty:start
./mvnw -ntp -f inventory/pom.xml failsafe:integration-test liberty:stop
./mvnw -ntp -f inventory/pom.xml pact:publish

## Build the system service
./mvnw -ntp -Dhttp.keepAlive=false \
    -Dmaven.wagon.http.pool=false \
    -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 \
    -f system/pom.xml \
    -q clean package liberty:create liberty:install-feature liberty:deploy

## Run the integration and publish goal for system service
./mvnw -ntp -f system/pom.xml liberty:start
./mvnw -ntp -f system/pom.xml failsafe:integration-test liberty:stop

## Remove the pact-broker application
cd ..
docker compose -f "pact-broker/docker-compose.yml" down
docker rmi postgres:17.2
docker rmi pactfoundation/pact-broker:latest
docker volume rm pact-broker_postgres-volume
