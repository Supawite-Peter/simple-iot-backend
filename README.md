# Simple IoT Back-end

## Description

A simple IoT back-end server application based on the Nest.js framework. Supporting user/device registration and database services.

## Planning Features

- :white_check_mark: Users Management Module
- :white_check_mark: Users Authentication Module 
- :white_check_mark: Devices Management Module
- :white_check_mark: Devices Data Module
- :white_check_mark: MonogoDB implementation on Users/Devices Module
- :black_square_button: API Docs
- :black_square_button: Support Timestamp in Devices Data Service
- :black_square_button: e2e Test
- :black_square_button: MQTT Support
- :black_square_button: Simple Web Front-end
- ...

## Requirements

1. Node.js (version >= 16)
2. MongoDB (Tested on 8.0)

## Project setup

1. Clone this project and install node.js packages

    ```bash
    $ npm install
    ```

2. Update environment variables in `.env.example`

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application should be serving on port `3000`. (Default)

## Run tests

```bash
# unit tests
$ npm run test
```
