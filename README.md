# Simple IoT Back-end

## Description

A simple IoT back-end server application based on the Nest.js framework. Serving user/device registration and database services through REST API.

## Concept

Users can register an IoT device with specific topics, each of which stores the sensor values transmitted from that device, as illustrated in this diagram. 

![alt text](/docs/images/image.png)

Additionally, users have the flexibility to freely add or delete new devices and topics as needed. 

Furthermore, users can query the latest data or data from a preferred time period.

## Planning Features

- :white_check_mark: Users Management Module
- :white_check_mark: Users Authentication Module 
- :white_check_mark: Devices Management Module
- :white_check_mark: Devices Data Module
- :white_check_mark: MonogoDB implementation on Users/Devices Module
- :white_check_mark: Support Timestamp Devices Data
- :white_check_mark: API Docs
- :white_check_mark: Migrate User/Device/Topic to SQL DB
- :black_square_button: JWT Refresh/Access Token
- :black_square_button: JWT Cookie
- :black_square_button: API Key for Devices Data
- :black_square_button: Swagger UI Page
- :black_square_button: e2e Test
- :black_square_button: MQTT Support
- :black_square_button: User Role
- :black_square_button: Aggregate Sensor Data
- :black_square_button: Simple Web Front-end
- ...

## Requirements

1. Node.js (version >= 16)
2. MongoDB (Tested on 8.0) For timeseries DB
3. MySQL (Tested on 8.0.40)

## Project setup

1. Clone this project and install node.js packages

    ```bash
    $ npm install
    ```

2. Update environment variables in `.env.development.local`

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

## API

### Users

#### Add or Remove User Account

<details>
 <summary><code>POST</code> <code><b>/users</b></code> <code>(Register new user account)</code></summary>

##### Authentication

> None

##### Parameters

> None

##### Body

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | username   | required | string | string of username  |
> | password   | required | string | string of password  |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `201` | `application/json` | `{"id": 1 ,"username": hello}` |
> | `400` | `application/json` | `{"message": "Validation failed","statusCode": 400}` |
> | `409` | `application/json` | `{"message": "Username already exists","error": "Conflict","statusCode": 409}` |

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/users' \
> --header 'Content-Type: application/json' \
> --data '{
>    "username": "hello",
>    "password": "world"
> }'
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/users</b></code> <code>(Delete user account)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |


##### Parameters

> None

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | password   | required | string | string of password


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`        | `{"id": 1, "username": "hello"}`|
> | `400`         | `application/json`                | `{"message": "Validation failed","statusCode": 400}`|
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "User does not exist","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location --request DELETE 'http://localhost:3000/users' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "password": "world"
> }'
> ```

</details>

---------------------------------------------------------

### Auth

#### Login

<details>
 <summary><code>POST</code> <code><b>/auth/login</b></code> <code>(Login and get JWT Token)</code></summary>

##### Authentication

> None

##### Parameters

> None

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | username   | required | string | string of username  |
> | password   | required | string | string of password


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `200`     | `application/json` | `{"accessToken": {{JWT_TOKEN}}}`|
> | `400`     | `application/json` | `{"message": "Validation failed","statusCode": 400}`|
> | `401`     | `application/json` | `{"message": "Incorrect password","statusCode": 401}`|
> | `404`     | `application/json` | `{"message": "User doesn't exist","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/auth/login' \
> --header 'Content-Type: application/json' \
> --data '{
>    "username": "hello",
>    "password": "world"
> }'
> ```

</details>

------------------------------------------------------

### Devices

#### Add or Remove Device

<details>
 <summary><code>POST</code> <code><b>/devices</b></code> <code>(Register new device to user)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |

##### Parameters

> None

##### Body

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | name   | required | string   | Name of the device  |
> | topics | optional | string[] or string | Topics to be registered   |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `201` | `application/json` | `{"id": 1, "name": "device1", "userId": 1, "topics": ["temp", "rh"]}` |
> | `400` | `application/json` | `{"message": "Validation failed","statusCode": 400}` |
> | `400` | `application/json` | `{"message": "Device name is missing","statusCode": 400}` |
> | `404` | `application/json` | `{"message": "User not found","statusCode": 404}` |

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "name": "device1",
>    "topics": ["temp","rh"]
>}'
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/devices</b></code> <code>(Delete registered device)</code></summary>

##### Authentication

> | header      |  type    | description   |      
> |-----------|-----------|-------------------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login


##### Parameters

> None

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | id  | required | string or number | device id to be delete |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`        | `{"id": 1, "name": "device2", "userId": 1, "topics": ["temp", "rh"]}`|
> | `400`         | `application/json`         | `{"message": "Validation failed","statusCode": 400}`|
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{deviceId}} was not found for user with id {{userId}}","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location --request DELETE 'http://localhost:3000/devices' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "id": "1"
> }'
> ```

</details>

--------------------------------------------------------------------

#### Add or Remove Topics

<details>
 <summary><code>POST</code> <code><b>/devices/{deviceId}/topics</b></code> <code>(Add new topics to a device)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `deviceId` | required | number | target device id to add topics |

##### Body

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | topics   | required | string[] or string   | topics to be added |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `201` | `application/json` | `{"topicsAdded": 1, "topics": ["air"]}` |
> | `400`         | `application/json`                | `{"message": "Validation failed","statusCode": 400}`|
> | `400`         | `application/json`         | `{"message": "Topics are already registered","statusCode": 400}`|
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{deviceId}} was not found for user with id {{userId}}","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices/1/topics' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "topics": "air"
>}'
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/devices/{deviceId}/topics</b></code> <code>(Remove registered topic from a device)</code></summary>

##### Authentication

> | header      |  type    | description   |      
> |-----------|-----------|-------------------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login


##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `deviceId` | required | number | target device id to delete topics |

##### Body

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | topics  | required | string or string[] | topics to be removed |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `201` | `application/json` | `{"topicsRemoved": 1, "topics": ["air"]}` |
> | `400`         | `application/json`                | `{"message": "Validation failed","statusCode": 400}`|
> | `400`         | `application/json`         | `{"message": "Topics are not registered","statusCode": 400}`|
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{deviceId}} was not found for user with id {{userId}}","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location --request DELETE 'http://localhost:3000/devices/1/topics' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "topics": "air"
> }'
> ```

</details>

----------------------------------------------

#### List User Owned Devices

<details>
 <summary><code>GET</code> <code><b>/devices</b></code> <code>(List every devices registered by current user)</code></summary>

##### Authentication

> | header      |  type    | description   |      
> |-----------|-----------|-------------------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login


##### Parameters

> None

##### Body

> None


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `200` | `application/json` | `[{"id": 1, "name": "device1", "userId": 1,  "topics": ["temp", "rh"]}]` |
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "No devices found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}'
> ```

</details>


----------------------------------------------

#### Sending Sensor Data to a Topic

<details>
 <summary><code>POST</code> <code><b>/devices/{deviceId}/{topic}</b></code> <code>(Sending Sensor Data to a Topic)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `deviceId` | required | number | target device id to storing data |
> | `topic` | required | string | target topic to storing data |

##### Body

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | payload | required | object or object[] | `{timestamp: {{iso_timestamp}}, value: {{number}}}` |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `201` | `application/json` | `[{"timestamp": {{iso_timestamp}},"metadata":{"topic":{{topic}},"device_id":{{device_id}}},"value":{{number}}}, ...]` |
> | `400`         | `application/json`                | `{"message": "Validation failed","statusCode": 400}`|
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `401`         | `application/json`         | `{"message": "Requester is not the owner of the device","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{device_id}} was not found","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices/1/temp' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>   "payload": [
>        {
>            "value": 0
>        },
>        {
>            "timestamp": "2024-10-18T08:54:50.318Z",
>            "value" : 3
>        }
>    ]
>}'
> ```

#### Example Response

>```javascript
>[
>    {
>        "timestamp": "2024-10-18T10:57:26.776Z",
>        "metadata": {
>            "topic": "temp",
>            "device_id": 5
>        },
>        "value": 0
>    },
>    {
>        "timestamp": "2024-10-18T10:54:05.904Z",
>        "metadata": {
>            "topic": "temp",
>            "device_id": 5
>        },
>        "value": 3
>    }
>]
>```

</details>

----------------------------------------------

#### Query Sensor Data

<details>
 <summary><code>GET</code> <code><b>/devices/{deviceId}/{topic}/latest</b></code> <code>(Query latest data from a topic)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `deviceId` | required | number | target device id to storing data |
> | `topic` | required | string | target topic to storing data |

##### Body

> None


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `200` | `application/json` | `{{"timestamp": {{iso_timestamp}},"metadata":{"topic":{{topic}},"device_id":{{device_id}}},"value":{{number}}}}` |
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `401`         | `application/json`         | `{"message": "Requester is not the owner of the device","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{device_id}} was not found","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "No Latest Data Found","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices/1/temp/latest' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}'
> ```

#### Example Response

>```javascript
>{
>    "metadata": {
>        "device_id": 5,
>        "topic": "temp"
>    },
>    "timestamp": "2024-10-18T10:57:26.776Z",
>    "value": 0
>}
>```

</details>

<details>
 <summary><code>GET</code> <code><b>/devices/{deviceId}/{topic}/periodic</b></code> <code>(Query sensor data in between time)</code></summary>

##### Authentication

> | header | type | description |      
> |--------|------|-------------|
> | Authorization   | Bearer {{JWT_TOKEN}} | Get from /auth/login |

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `deviceId` | required | number | target device id to storing data |
> | `topic` | required | string | target topic to storing data |

##### Body

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | from | required | ISO String Datetime | datetime indicating the starting point of requested data |
> | to   | required | ISO String Datetime |  datetime indicating the end of requested data |


##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | `200` | `application/json` | `[{{"timestamp": {{iso_timestamp}},"metadata":{"topic":{{topic}},"device_id":{{device_id}}},"value":{{number}}}, ...]}` |
> | `401`         | `application/json`         | `{"message": "Unauthorized","statusCode": 401}`|
> | `401`         | `application/json`         | `{"message": "Requester is not the owner of the device","statusCode": 401}`|
> | `404`         | `application/json`         | `{"message": "Device with id {{device_id}} was not found","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "User not found","statusCode": 404}`|
> | `404`         | `application/json`         | `{"message": "No Data Found From The Given Period","statusCode": 404}`|

##### Example cURL

> ```javascript
> curl --location 'http://localhost:3000/devices/1/temp/periodic' \
> --header 'Authorization: Bearer {{JWT_TOKEN}}' \
> --header 'Content-Type: application/json' \
> --data '{
>    "from": "2024-10-18T11:03:28.273Z",
>    "to": "2024-10-18T11:05:28.273Z"
>}'
> ```

#### Example Response

>```javascript
>[
>    {
>        "metadata": {
>            "device_id": 5,
>            "topic": "temp"
>        },
>        "timestamp": "2024-10-18T11:05:25.896Z",
>        "value": 1
>    },
>    {
>        "metadata": {
>            "device_id": 5,
>            "topic": "temp"
>        },
>        "timestamp": "2024-10-18T11:05:25.062Z",
>        "value": 1
>    }
>]
>```

</details>

----------------------------------------------