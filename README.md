# Wildmile Management Portal

## Requirements

- Node.js 20 or later (Prefer to use the latest LTS version)
    - Node v22.10.0 is incompatible
    - Node v20.19.0 is compatible
    - if cleaning up and restarting
        - Remove-Item -Recurse -Force node_modules
        - Remove-Item -Force package-lock.json
    - npm install
    - npm audit fix --force
- A MongoDB server (You can use a free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Getting Started

## Option 1: Run it Locally without Docker

### Step 1. Get the connection string of your MongoDB server

In the case of MongoDB Atlas, it should be a string like this:

```
mongodb+srv://<username>:<password>@my-project-abc123.mongodb.net/test?retryWrites=true&w=majority
```

For more details, follow this [MongoDB Guide](https://docs.mongodb.com/guides/server/drivers/) on how to connect to MongoDB.

### Step 2. Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cd wildmile
cp .env.local.example .env.local
```

Then set each variable on `.env.local`:

- `MONGODB_URI` should be the MongoDB connection string you got from step 1.

### Step 3. Run Next.js in development mode

```bash
npm install
npm run dev

# or

yarn install
yarn dev
```

Your app should be up and running on [http://localhost:3000](http://localhost:3000)! If it doesn't work, post on [GitHub discussions](https://github.com/vercel/next.js/discussions).


## Option 2: Running it locally using docker

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) 

Once the docker engine is running at the root folder run `docker compose up -d`. That will bring up the Mongo Database locally and seed it with the files in the repo and then create a container to run the nextJS application. You can access the website at `localhost:8080`

To run commands on the node app, like installing new packages or something similar you can exec into the container by doing `docker compose exec web bash`, which will create a terminal window for the container. Note that actions in the container are ephemeral and will not persist on rebuild.

## Running Tests

This project uses [Jest](https://jestjs.io/) for unit testing.

### 1. Install Dependencies

Ensure all project dependencies are installed:
```bash
npm install
```

### 2. Test Execution

The necessary Jest packages (`jest`, `babel-jest`, `@babel/preset-env`, `@babel/preset-react`) have been added to `devDependencies` in `package.json` and will be installed by the command above.

A test script has been added to `package.json`. You can run the tests using:
```bash
npm test
```
This command will execute Jest and run all test files found in the project (typically `*.test.js` or files in `__tests__` directories).