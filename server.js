const express = require("express");
const cors = require("cors");
const app = express();
const { Client } = require("pg");
const hasher = require("pbkdf2-password-hash");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { response } = require("express");
dotenv.config();
let PORT = process.env.PORT || 8080;

const corsSettings = {
  origin: [
    "http://localhost:3000",
    "https://brain-training-website.sigmalabs.co.uk/",
  ],
  credentials: true,
};

const connectionString =
  "postgres://ibkwudpc:17jUoB8WcN7NdziBCuBPme5djoEVbdec@tyke.db.elephantsql.com/ibkwudpc";

const client = new Client(connectionString);
client.connect();

app.use(cors(corsSettings));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.listen(PORT, function () {
  console.log("CORS-enabled web server listening on port " + PORT);
});
``;
app.get("/login", async (req, res) => {
  await getUser(req, res);
});

app.post("/leaderboard", async (req, res) => {
  await postLeaderboard(req, res);
});

app.get("/leaderboard", async (req, res) => {
  await getLeaderboard(req, res);
});

app.post("/register", async (req, res) => {
  await registerUser(req, res);
});

app.get("/sessions", async (req, res) => {
  await getLoggedInUser(req, res);
});

app.post("/sessions", async (req, res) => {
  await startSession(req, res);
});

app.delete("/sessions", async (req, res) => {
  await endSession(req, res);
});

app.patch("/profile/win_message", async (req, res) => {
  await addWinMessage(req, res);
});

app.patch("/profile/picture", async (req, res) => {
  await updateProfilePicture(req, res);
});

app.get("/profile", async (req, res) => {
  await getProfile(req, res);
});

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

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await client.query(
      `select * FROM leaderboard ORDER BY score DESC`
    );
    res.json(leaderboard.rows);
  } catch (err) {
    res.json(err);
  }
}

async function postLeaderboard(req, res) {
  const { username, score } = await req.body;
  if (username && score) {
    const sessionID = req.cookies.sessionID;
    const user = await getUserFromID(sessionID);
    await client.query(
      `INSERT INTO leaderboard (user_id,username,score,achieved_at) VALUES($1,$2,$3,NOW())`,
      [user[0].id, username, score]
    );
    res.json({ response: "added to leaderboard" });
  } else {
    res.json({ response: "cannot add to leader" });
  }
}

async function addWinMessage(req, res) {
  const { message } = await req.body;
  if (message) {
    const sessionID = req.cookies.sessionID;
    const user = await getUserFromID(sessionID);
    await client.query(
      `UPDATE user_customisation SET win_message = $1 WHERE user_id = $2`,
      [message, user[0].id]
    );
    res.json({ response: "win message updated" });
  } else {
    res.json({ response: "message not updated" });
  }
}

async function updateProfilePicture(req, res) {
  const { profilePictureID } = await req.body;
  if (profilePictureID) {
    const sessionID = req.cookies.sessionID;
    const user = await getUserFromID(sessionID);
    await client.query(
      `UPDATE user_customisation SET profile_picture_id = $1 WHERE user_id = $2`,
      [profilePictureID, user[0].id]
    );
    res.json({ response: "profile picture updated" });
  } else {
    res.json({ response: "profile picture not updated" });
  }
}

async function getProfile(req, res) {
  try {
    const sessionID = req.cookies.sessionID;
    const user = await getUserFromID(sessionID);
    const profile = await client.query(
      `SELECT user_id,win_message,profile_picture_id,has_crown,username FROM user_customisation JOIN users ON users.id = user_customisation.user_id WHERE user_customisation.user_id = $1`,
      [user[0].id]
    );
    return res.json({ response: "user found", user: profile.rows[0] });
  } catch (err) {
    res.json(err);
  }
}

async function startSession(req, res) {
  const { userID } = await req.body;
  if (userID) {
    const sessionID = crypto.randomUUID();
    await client.query(
      "INSERT INTO sessions (uuid, created_at, user_id) VALUES ($1, NOW(), $2)",
      [sessionID, userID]
    );
    res.cookie("sessionID", sessionID);
    console.log(req.cookies.sessionID);
    return res.json({ response: "session started" });
  } else {
    res.json({ response: "session not started" });
  }
}

async function endSession(req, res) {
  try {
    const sessionID = req.cookies.sessionID;
    await client.query(`DELETE FROM sessions WHERE uuid = $1`, [sessionID]);
    res.json({ response: "session ended" });
  } catch (err) {
    res.json(err);
  }
}

async function getLoggedInUser(req, res) {
  const sessionID = req.cookies.sessionID;
  console.log(sessionID);
  const user = await getUserFromID(sessionID);
  if (user.length > 0) {
    return res.json({ response: true });
  } else {
    return res.json({ response: false });
  }
}

async function getUserFromID(sessionID) {
  const user = await client.query(
    "SELECT * FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.uuid = $1",
    [sessionID]
  );
  return user.rows;
}

module.exports = app;
