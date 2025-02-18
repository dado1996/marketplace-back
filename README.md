# Marketplace Back

## Installation instructions

Make sure to have installed Docker to setup the database more easily, or you can set it up yourself and just provide the database url into the `.env` file

1. Clone the repo
2. Run the command `npm install`
3. Setup the environment variables according to the `.env.example` file
4. Run the command `npm run db:dev:restart` (optional)
5. Run the command `npm run start:dev` to run the application in development mode or...
6. Run the command `npm run start:prod` to run the application in production mode from the `dist/` folder
