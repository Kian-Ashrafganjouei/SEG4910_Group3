FROM postgres:latest

ENV POSTGRES_PASSWORD=password

# Copy initialization scripts to the container
COPY init.sql /docker-entrypoint-initdb.d/
