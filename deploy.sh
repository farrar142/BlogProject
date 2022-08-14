docker-compose -f docker-compose.deploy.yaml build --force-rm --no-cache
docker-compose -f docker-compose.deploy.yaml up -d
#