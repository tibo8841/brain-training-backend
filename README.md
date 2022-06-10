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

endpoint is /register and it takes a body object including the username and the password.
If the username already exists the request is denied.

```
async function registerUser(req, res) {
  const { username, password } = await req.body;

  const usernameCheck = await client.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  if (usernameCheck.rows.length != 0) {
    res.json({ response: "username already exists" });
  } else {
    await client.query(
      `INSERT INTO users (username,password,created_at) VALUES($1,$2,NOW())`,
      [username, await hasher.hash(password)]
    );
    const newUser = await client.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    await client.query(
      `INSERT INTO user_customisation (user_id,win_message,profile_picture_id,has_crown)
    VALUES($1,'Not all dreamers are winners, but all winners are dreamers. Your dream is the key to your future',$2,FALSE)`,
      [newUser.rows[0].id, Math.floor(Math.random() * 31) + 1]
    );
    res.json({ response: "added new user" });
  }
}
```

### User Log-in

The endpoint is /login.
The query takes the form /login?username={username}&password={password}.
If the username doesn't exist or the password does not match an appropriate error is given.

```
async function getUser(req, res) {
  const { username, password } = await req.query;

  const result = await client.query(
    `SELECT * FROM users JOIN user_customisation ON user_customisation.user_id = users.id WHERE username = $1`,
    [username]
  );
  if (result.rows.length === 0) {
    res.json({ response: "User not found" });
  } else {
    const auth = await hasher.compare(password, result.rows[0].password);
    if (!auth) {
      res.json({ response: "Incorrect Password" });
    } else {
      res.json({ response: "User Found", user: result.rows[0] });
    }
  }
}
```

### Profile Customisation

The end points are /profile/picture and /profile/win_message
Once a user is logged in they can personalise their profile.

```
async function addWinMessage(req, res) {
  const { message } = await req.body;
  const sessionID = req.cookies.sessionID;
  const user = await getUserFromID(sessionID);
  await client.query(
    `UPDATE user_customisation SET win_message = $1 WHERE user_id = $2`,
    [message, user[0].id]
  );
  res.json({ response: "win message updated" });
}

async function updateProfilePicture(req, res) {
  const { profilePictureID } = await req.body;
  const sessionID = req.cookies.sessionID;
  const user = await getUserFromID(sessionID);
  await client.query(
    `UPDATE user_customisation SET profile_picture_id = $1 WHERE user_id = $2`,
    [profilePictureID, user[0].id]
  );
  res.json({ response: "profile picture updated" });
}
```

### Sessions

The endpoint is /sessions
Sessions are started on log-in and ended when the user logs out.

```
async function startSession(req, res) {
  const { userID } = await req.body;
  const sessionID = crypto.randomUUID();
  await client.query(
    "INSERT INTO sessions (uuid, created_at, user_id) VALUES ($1, NOW(), $2)",
    [sessionID, userID]
  );
  res.cookie("sessionID", sessionID);
  console.log(req.cookies.sessionID);
  return res.json({ response: "session started" });
}

async function endSession(req, res) {
  const sessionID = req.cookies.sessionID;
  await client.query(`DELETE FROM sessions WHERE uuid = $1`, [sessionID]);
  res.json({ response: "session ended" });
}
```

### Leader-boards

Leader-boards can be

```
async function getLeaderboard(req, res) {
  const { id } = await req.query;
  if (id) {
    const userLeaderboard = await client.query(
      `SELECT * FROM leaderboard WHERE user_id = $1 ORDER BY score DESC`,
      [id]
    );
    res.json(userLeaderboard.rows);
  } else {
    const leaderboard = await client.query(
      `select * FROM leaderboard ORDER BY score DESC`
    );
    res.json(leaderboard.rows);
  }
}

async function postLeaderboard(req, res) {
  const { username, score } = await req.body;
  const sessionID = req.cookies.sessionID;
  const user = await getUserFromID(sessionID);
  await client.query(
    `INSERT INTO leaderboard (user_id,username,score,achieved_at) VALUES($1,$2,$3,NOW())`,
    [user[0].id, username, score]
  );
  res.json({ response: "added to leaderboard" });
}
```

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
