---------------------------- DATABASE SETUP ---------------------------------------------
-- Create the root superuser and database to supress PG's warnings.
CREATE USER root superuser;
CREATE DATABASE root;

-- Create a new database --
CREATE DATABASE main;
\connect main;
