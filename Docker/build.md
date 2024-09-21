## Build instructions
To start Spring:
1. clone the repo. We're going to assume that the repo resides in a folder called `PROJECT_ROOT`.
2. `cd` into `PROJECT_ROOT` and run `docker compose -f Docker/docker-compose.yml run -p 8080:8080 --rm backend`.

This command will give you a terminal running in an environment where you can compile the project.

3. Run inside the aforementioned terminal `./gradlew bootRun`.
4. Go to `localhost:8080` and you should see a blank page.
5. You can edit the code now and see your changes in your local browser.

