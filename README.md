The deployment requires chainbreak.dev docker to have a network called nginx-network.

# docker-compose.yml

The file contains variable fields such as `${POSTGRES_PASSWORD}` which will be filled by portainer stack env variables, or locally using `docker-compose --env-file ./.env up -d`

The node app container is setup to be started only when `COMPOSE_PROFILES=production`

# Reach a container from outside

## Containers setup

In the docker-compose.yml file, make sure to have

```yaml
networks:
    nginx-network:
        external: true
        name: nginx-network
```

and, on the container that need to be reachable :

```yaml
ports:
    - "8080" # Not specifying a dest port lets docker choose an available one automatically
environment:
    # ...
    VIRTUAL_HOST: ${VIRTUAL_HOST} # this will be filled by portainer
    LETSENCRYPT_HOST: ${VIRTUAL_HOST}
networks:
    # ...
    - nginx-network
```

## Portainer deployment

-   Go to https://portainer.chainbreak.dev > Stacks > Add
-   Fill all the required informations, **including the Authentication** part, so portainer can pull the docker image from ghcr.io
-   Copy/Paste the content of your local .env file, and set `VIRTUAL_HOST=your_desired_name.chainbreak.dev` and `COMPOSE_PROFILES=production`
-   You're good to go
