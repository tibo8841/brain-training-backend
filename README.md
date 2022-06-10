# DR ALEX'S BRAIN TRAINING BACKEND DOCUMENTATION

## Contents

- [Introduction](#introduction)
- [Technologies](#technologies)
- [Launch](#launch)
- [Server Endpoints](#server-endpoints)
  - [Register User](#register-user)
  - [User Log-in](#user-log-in)
  - [Profile Customisation](#profile-customisation)
  - [Sessions](#sessions)
  - [Leader-board](#leader-board)
- [Database Schema](#database-schema)
  - [Users](#users)
  - [Sessions](#sessions-1)
  - [User Customisation](#user-customisation)
  - [Leader-board](#leader-board-1)
- [Developers](#developers)

## Introduction

This is the backend server of the brain training app that handles http requests from the client to register, log-in, customise their profile and add scores to the leader-board.

## Technologies

This repository uses [node](https://nodejs.org/en/docs/) to run its files.
For our database we use [PostgreSQL](https://www.postgresql.org/) to store user information online using [ElephantSQL](https://www.elephantsql.com/).

## Launch

This server communicates with a [front-end](https://github.com/Sigma-Labs-XYZ/brain-training-frontend)
To access this back-and you need to clone the repository and use the command

```
npm install
```

in order to install all of the relevant modules.
You can launch the server on a local-host (8080) using

```
npm start
```

You can run tests using

```
npm test
```

## Server Endpoints

### Register User

### User Log-in

### Profile Customisation

### Sessions

### Leader-boards

## Database Schema

### Users

```
CREATE TABLE users (
     id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
     )
```

### Sessions

```
CREATE TABLE sessions (
    uuid TEXT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
     user_id INTEGER
    )
```

### User Customisation

```
CREATE TABLE user_customisation (
    user_id INTEGER NOT NULL,
    win_message TEXT NOT NULL,
    profile_picture_id INTEGER NOT NULL,
    has_crown BOOLEAN NOT NULL,
    CONSTRAINT fk_user_id
       FOREIGN KEY (user_id)
       REFERENCES users(id)
    )
```

### Leader-board

```
CREATE TABLE leaderboard (
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    achieved_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_id
       FOREIGN KEY (user_id)
       REFERENCES users(id)
    )
```

## Developers

The Developers that worked on this project are:

Project Manager & Engineer: [Thibaut Hucker](https://github.com/tibo8841)<br/>
Architect & Engineer: [Kamilah Mohchin](https://github.com/KamCoder5)<br/>
Quality Assurance & Engineer: [Milan Patel](https://github.com/milanpat42)<br/>
Quality Assurance & Engineer: Dr.[Alex Convoy](https://github.com/agConvoy)
