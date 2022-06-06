const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;
const { Client } = require("pg");
const hasher = require("pbkdf2-password-hash");
const cookieParser = require("cookie-parser");

const connectionString =
  "postgres://ibkwudpc:17jUoB8WcN7NdziBCuBPme5djoEVbdec@tyke.db.elephantsql.com/ibkwudpc";

const client = new Client(connectionString);
client.connect();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.listen(PORT, function () {
  console.log("CORS-enabled web server listening on port 8080");
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
    const auth = hasher.compare(password, result.rows[0].password);
    if (!auth) {
      res.json({ response: "Incorrect Password" });
    } else {
      res.json({ response: "User Found", user: result.rows[0] });
    }
  }
}

async function registerUser(req, res) {
  const { username, password } = await req.body;

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
  const { userID, username, score } = await req.body;
  await client.query(
    `INSERT INTO leaderboard (user_id,username,score,achieved_at) VALUES($1,$2,$3,NOW())`,
    [userID, username, score]
  );
  res.json({ response: "added to leaderboard" });
}

async function addWinMessage(req, res) {
  const { userID, message } = await req.body;
  await client.query(
    `UPDATE user_customisation SET win_message = $1 WHERE user_id = $2`,
    [message, userID]
  );
  res.json({ response: "win message updated" });
}

async function updateProfilePicture(req, res) {
  const { userID, profilePictureID } = await req.body;
  await client.query(
    `UPDATE user_customisation SET profile_picture_id = $1 WHERE user_id = $2`,
    [profilePictureID, userID]
  );
  res.json({ response: "profile picture updated" });
}

async function getProfile(req, res) {
  const { id } = await req.query;
  const profile = await client.query(
    `SELECT * FROM user_customisation WHERE user_id = $1`,
    [id]
  );
  console.log(profile);
  res.json({ response: "user found", user: profile.rows[0] });
}
