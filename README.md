# Distributed Logging System

A Spring Boot based logging service that accepts log messages through REST APIs, stores them in MongoDB, and exposes them for retrieval.

This project was created as a distributed systems learning project. The current codebase implements the core log ingestion and persistence layer. The broader system design is based on distributed logging concepts such as centralized log collection, durable storage, replication, consistency, fault tolerance, and time ordering.

## What This System Is About

In distributed applications, different services often run on different machines or processes. Each service produces logs independently. Without a central logging system, debugging becomes difficult because logs are scattered across many places.

This project models the foundation of a distributed logging system:

- clients send log messages to a logging service
- the service validates the request
- valid logs are stored in MongoDB
- stored logs can be retrieved through an API
- MongoDB can later be extended with replica sets for higher availability

The goal is to provide a clean backend base that can later evolve into a more complete distributed logging platform.

## Current Implementation

The current implementation contains:

- a Spring Boot REST API
- a `LogEntry` MongoDB document model
- a Spring Data MongoDB repository
- a service layer for validation and persistence
- API endpoints for creating and reading logs
- local MongoDB configuration

The current API stores a simple log entry with:

- `id`
- `message`
- `timestamp`

## Tech Stack

- Java 17
- Spring Boot 3.2
- Spring Web
- Spring Data MongoDB
- MongoDB
- Maven

## How It Works

The request flow is:

```text
Client
  |
  | HTTP POST /api/logs
  v
LogController
  |
  | validates request through service
  v
LogService
  |
  | creates LogEntry
  v
LogEntryRepository
  |
  | persists document
  v
MongoDB
```

Reading logs follows the reverse path:

```text
Client
  |
  | HTTP GET /api/logs
  v
LogController
  |
  v
LogService
  |
  v
LogEntryRepository
  |
  v
MongoDB
```

## Theoretical Analysis

### 1. Distributed Logging

Distributed logging is the process of collecting logs from multiple services, machines, or application nodes into one reliable system. This helps developers and operators understand what happened across the full system instead of checking logs service by service.

In a full distributed logging system, logs usually need to support:

- ingestion from many clients
- durable storage
- search and filtering
- ordering by time
- retention policies
- replication
- failure recovery
- monitoring and alerting

This project currently implements the basic ingestion and storage part.

### 2. Centralized Log Collection

Centralized log collection means clients send logs to a common backend rather than storing them only locally. This makes debugging easier because logs can be viewed from one place.

In this project, the Spring Boot application acts as the central log receiver.

### 3. Persistence and Durability

Logs are useful only if they are not lost during application restarts. MongoDB is used as the persistence layer so logs are stored outside the application process.

The current persistence model is simple:

```text
LogEntry -> MongoDB collection: logs
```

Each log entry is stored as a MongoDB document.

### 4. Replication and Fault Tolerance

In distributed systems, fault tolerance means the system continues working even when part of it fails.

MongoDB can support fault tolerance through replica sets. A replica set keeps copies of the same data on multiple MongoDB nodes. If the primary node fails, another node can be elected as primary.

The current local setup uses a single MongoDB instance. Replica set configuration is a possible next step, but it is not required to run the current project.

### 5. Consistency

Consistency means clients should see reliable and predictable data. For a logging system, consistency matters because missing or duplicated logs can make debugging misleading.

MongoDB provides configurable consistency behavior through write concerns and read preferences. The current project uses Spring Data MongoDB defaults. Future improvements could explicitly configure write concern, duplicate handling, and stronger delivery guarantees.

### 6. Time Ordering

Logs are usually analyzed by timestamp. This project assigns a timestamp when a `LogEntry` is created.

In a larger distributed system, timestamps are harder because different machines may have slightly different clocks. Production systems often use:

- NTP time synchronization
- logical clocks
- event sequence numbers
- server-side timestamps

The current project uses Java `LocalDateTime.now()` at the application layer.

### 7. Service Layer Separation

The code is split into controller, service, repository, and model layers:

- controllers handle HTTP requests and responses
- services contain validation and application logic
- repositories handle database access
- models define stored data

This separation keeps the code easier to test and extend.

## Project Structure

```text
.
├── pom.xml
├── README.md
├── src
│   └── main
│       ├── java
│       │   └── com/logsystem
│       │       ├── LogSystemApplication.java
│       │       ├── config
│       │       │   └── MongoConfig.java
│       │       ├── controller
│       │       │   ├── LogController.java
│       │       │   └── TestDataController.java
│       │       ├── model
│       │       │   └── LogEntry.java
│       │       ├── repository
│       │       │   └── LogEntryRepository.java
│       │       └── service
│       │           └── LogService.java
│       └── resources
│           └── application.properties
└── .gitignore
```

## Prerequisites

Install:

- Java 17 or newer
- Maven 3.9 or newer
- MongoDB

The application expects MongoDB to run locally on port `27017`.

## Configuration

Default configuration is in:

```text
src/main/resources/application.properties
```

Default values:

```properties
server.port=8081
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=logsystem
```

You can override Spring Boot settings with environment variables:

```bash
export SERVER_PORT=8081
export SPRING_DATA_MONGODB_HOST=localhost
export SPRING_DATA_MONGODB_PORT=27017
export SPRING_DATA_MONGODB_DATABASE=logsystem
```

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd Distributed-Logging-System
```

Install dependencies and compile:

```bash
mvn clean install
```

Start MongoDB.

With Homebrew on macOS:

```bash
brew services start mongodb/brew/mongodb-community
```

Or run a temporary local MongoDB process:

```bash
mkdir -p /tmp/distributed-logging-mongodb
mongod --dbpath /tmp/distributed-logging-mongodb --bind_ip 127.0.0.1 --port 27017
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The API runs at:

```text
http://localhost:8081
```

## API Endpoints

### Create a Log

```http
POST /api/logs
```

Request body:

```json
{
  "message": "Application started successfully"
}
```

Example:

```bash
curl -X POST http://localhost:8081/api/logs \
  -H "Content-Type: application/json" \
  -d '{"message":"Application started successfully"}'
```

If `message` is missing or blank, the API returns `400 Bad Request`.

### Get All Logs

```http
GET /api/logs
```

Example:

```bash
curl http://localhost:8081/api/logs
```

### Test Data Endpoints

The project also exposes equivalent test endpoints:

```http
POST /api/test/data
GET /api/test/data
```

These currently use the same service logic as `/api/logs`.

## Quick Smoke Test

1. Start MongoDB.
2. Start the Spring Boot app.
3. Create a log:

```bash
curl -X POST http://localhost:8081/api/logs \
  -H "Content-Type: application/json" \
  -d '{"message":"smoke test log"}'
```

4. Read logs:

```bash
curl http://localhost:8081/api/logs
```

You should see the saved log entry in the response.

## Useful Commands

Build:

```bash
mvn clean install
```

Run tests:

```bash
mvn test
```

Run the app:

```bash
mvn spring-boot:run
```

## Current Limitations

- No authentication or authorization.
- No search, filtering, or pagination yet.
- No automated tests yet.
- No explicit MongoDB replica set setup in the repository.
- No retention or cleanup policy for old logs.
- No distributed clock synchronization implementation yet.
- No UI dashboard yet.

## Possible Future Enhancements

- Add unit and integration tests.
- Add log levels such as `INFO`, `WARN`, and `ERROR`.
- Add search and filtering by message, timestamp, or level.
- Add pagination for large log collections.
- Add MongoDB replica set documentation and configuration.
- Add structured log metadata such as service name, host, request ID, or trace ID.
- Add better error responses for database connectivity failures.
- Add Docker Compose for local MongoDB setup.

## Repository Hygiene

- `target/` is generated by Maven and should not be committed.
- `.env` files are ignored and should be used only for local settings.
- Do not commit secrets, credentials, local database files, or IDE-specific files.
