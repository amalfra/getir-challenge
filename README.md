# Getir challenge
A RESTful API with a single endpoint that fetches the data in the provided MongoDB collection and return the results in the requested format.

## Techstack
* Nodejs 14.x.x
* MongoDB
* Heroku
* Docker for packaging
* Github actions for CI/CD

## Run
App is live on Heroku @ https://amalfra-getir-challenge.herokuapp.com

To run via Docker just invoke ```./scripts/start.sh```. Otherwise just have correct Nodejs version installed, do ```npm i``` and run ```npm start``` command.

## Overview
The app is built using express framework and mongoose ODM. A straightforward and standard folder structure shown below is used for organizing the project:

```sh
https://github.com/amalfra/getir-challenge
|__
|__...             --> package.json, eslint config and lot of other configs mostly
|__.gtihub         --> Github actions config
|__scripts         --> Simple shell script to start app using Docker
|__tests           --> where all integration test code would be
|__src             --> where all app code would be 
   |__controllers  --> where all route handlers would be
   |__lib          --> where all common libs would be
   |__models       --> where all models would be
   |__routes       --> where all route definitions would be. controllers connected to URIs here
   |__app.js       --> entrypoint that will connect to DB, do setup and start server
```
The entire code is written using ESM, async/awaits and most of available ES6 fetures. Git pre-commit hooks using husky package is used to automatically lint and format
code on commit.

## Request/Response
The server is strict JSON based and so always returns JSON for success as well as errors. The following schema will be used for all responses:
```
{
  "code": <numeric>,
  "msg": <string>,
  .... 
}
```
Code and msg keys will always be present and it will be zero for sucess responses from route handlers and non-zero HTTP status codes for errors.
The HTTP status header would also be set accordingly like:
* 200 for success
* 400 for request payload format issues
* 422 for request payload validation issues
* 404 for routes not found
* 500 for all other errors like DB errors

The standard versioning of API using URL paths is followed. The routes currently supported are:
* POST /v1/records

  Sample JSON payload:
  ```
  {
    "startDate": "2016-01-26",
    "endDate": "2018-02-02",
    "minCount": 2700,
    "maxCount": 3000
  }
  ```
 
## Tests
Both unit and integration tests are present. Mocha is used as test runner as it supports ESM out of the box :cool:. Since there isn't much logical functions to write unit tests currently there is only unit tests for config loader function
that does validation and loads correct config values from ENV.
Integration tests have been written for all request and response payload conditions of the app server using supertest and inmemory mongo against which queries execute. 

## CI/CD
A simple CI/CD pipeline using Github actions is also setup. On push it will do linting and run both unit as well as integration tests.
On Github releases it will deploy the app to Heroku. The Docker version of Heroku is used and hence it's basically just build image and push to registry. So can be easily migrated if infra platform changes.
