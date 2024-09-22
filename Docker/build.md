## Build instructions
1. Clone th repo. We'll assume the repo is in a folder called `PROJECT_ROOT`.
2. `cd` into `PROJECT_ROOT` and run `docker compose -f Docker/docker-compose.yml up`.
3. This will build and start the frontend, backend, and database. You can access the frontend at `localhost:3000` (in the browswer), the backend at `localhost:8080` (in the browser)  and the database at `localhost:5432`.
4. Edit the code and run the build again to see your edits. (We plan on making the project hot-reloadable, that is, you don't have to build the project after you make edits. This is however a bit tricky and requires more effort.)
